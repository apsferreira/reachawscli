'use strict';

var exec = require('child_process').exec;
var pkg = require('../package.json');
var s3awa = './s3aws.js'
require('should');

describe('S3AWS Tests - Listing', function(){
    it('Should return version of S3AWS', function(done){
        exec(s3awa + ' --version', function(err, stdout, stderr){
            if(err) throw err;
            stdout.replace('\n', '').should.be.equal(pkg.version);
            done();
        });
    });

    it('Should return help of S3AWS', function(done){
        exec(s3awa + ' --help', function(err, stdout, stderr){
            if(err) throw err;
            stdout.replace('\n', '').should.be.equal(pkg.version);
            done();
        });
    });
});