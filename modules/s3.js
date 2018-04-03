var AWS         = require('aws-sdk');
var date        = require('../lib/date');
var Table       = require('cli-table2');
var async       = require('async');
var humanSize   = require('../lib/humanSize');
var jsonFile    = require('../modules/jsonFile');

AWS.config.update({ 
    "accessKeyId": "", 
    "secretAccessKey": "", 
    "region": "us-west-2" 
});

var s3          = new AWS.S3({apiVersion: '2006-03-01'});
var tableList   = new Table(
                            { 
                                head: [
                                    "Name of Bucket", 
                                    "Creation Date", 
                                    "Number of Archives", 
                                    "Total Size" ,
                                    "Last modified Date", 
                                    "locale"
                                ] 
                            });
exports.hasCache = false;

exports.validateCache = function(){
    jsonFile.readCache().forEach(function(data){
        if(data.lastTime){
            var dateCache = new Date(data.lastTime);
            var dateNow = new Date();
            if (dateCache.getTime() > dateNow.getTime()) {
                this.cache = true;
                return true;
            }
            else{
                this.cache = false;
                return false;
            }
        }
    });
}

exports.listBucket = function(bucket){
    if (this.hasCache){
        console.log(this.hasCache);
        jsonFile.readCache().forEach(function(data){
            if(data){
                if (data.object){
                    if (data.object.Name){
                        if(data.object.Name == bucket){
                            console.log(data.results.object[data.object]);
                        }
                    }
                }
            }
        });
    } else {
        this.listAll();
        this.listBucket(bucket);
    }
}

var buckets = [];
setTable = function(results, dateTime, length, human, cache){
    var bucket;
            
    var size = 0;
    var numberOfArchives;

    if (results){
        if (results.object){
            numberOfArchives = results.object.Contents.length;
            
            results.object.Contents.forEach(function(item){
                size += item.Size;
            });

            if (human)
                size = humanSize.convert(size,2);
            
            tableList.push([
                results.object.Name, 
                date.formatDate(dateTime), 
                numberOfArchives, 
                size,
                'desafio',
                results.locale
            ]);
        }
    }

    if (!cache){
        bucket = {
            results: results,
            dateTime: dateTime
        }

        buckets.push(bucket);

        if (length == 1){
            var dateNow = new Date();
            dateNow.setMinutes(dateNow.getMinutes()+5);
            buckets.push({lastTime: dateNow});
            jsonFile.writeCache(buckets);
            this.hasCache = true;
            console.log(tableList.toString());
        } 
    } else {
        if (length == 1){
            console.log(tableList.toString());
        }
    }
}

exports.listAll = function(human){
    var hasCache = false;
    var count = 0
    jsonFile.readCache().forEach(function(data){
        if(data.lastTime){
            dateCache = new Date(data.lastTime);
            dateNow = new Date();
            if (dateCache.getTime() > dateNow.getTime()) {
                hasCache = true;
            }
            else
                hasCache = false;
        }

        if(data.results){
            count ++;
        }
    });

    if (hasCache){
        var totalBucketsInCache = count;
        jsonFile.readCache().forEach(function(data){
            setTable(data.results, new Date(data.dateTime), totalBucketsInCache, human, true);
            totalBucketsInCache--;
        });
    }
    else{
        s3.listBuckets().promise().then(function(data){
            var totalBuckets = data.Buckets.length;

            data.Buckets.forEach(function(item){
                bucketName = {Bucket: item.Name};
                async.parallel({
                    object: function(callback){
                        s3.listObjects(bucketName).promise().then(function(object){
                            callback(null, object);
                        }).catch(function(err){
                            console.log("error on listObjects ", err);
                        });   
                    },
                    locale: function(callback){
                        s3.getBucketLocation(bucketName).promise().then(function(locale){
                            callback(null, locale.LocationConstraint);
                        }).catch(function(err){
                            console.log("error on getBucketLocation ", err);
                        });   
                    }
                }, function(err, results) {
                    if (err){
                        console.log("Erro on Paralell ", err)
                    } else {
                        setTable(results, item.CreationDate, totalBuckets, human, false);
                        totalBuckets--;
                    }
                });
            });
        }).catch(function(err){
            console.log("Error on listBuckets ", err);
        });
    }
}
