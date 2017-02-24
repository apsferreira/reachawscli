var jsonFile    = require('jsonfile');
var async       = require('async');
var file        = './.cache';

exports.writeCache = function(buckets){
    jsonFile.writeFile(file, buckets, function (err) {
        if (err) {
            throw err;
        }   
    });    
}

exports.readCache = function(callback){
    return jsonFile.readFileSync(file)
}