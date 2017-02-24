#!/usr/bin/env node --harmony
var pkg         = require('./package.json');
var chalk       = require('chalk');
var clear       = require('clear');
var figlet      = require('figlet');
var program     = require('commander');
var ProgressBar = require('progress'); 
var s3          = require('./modules/s3');


clear();
console.log(
  chalk.yellow(
    figlet.textSync('Rea.ch - S3 AWS', { horizontalLayout: 'full' })
  )
);

if(!s3.hasCache){
  var barOpts = {
    width: 100,
    total: 30,
    clear: true
  };
} else {
  var barOpts = {
    width: 100,
    total: 10,
    clear: true
  };
}
function progress(){
  var bar = new ProgressBar(' Loading [:bar] :percent :etas', barOpts);
  var timer = setInterval(function () {
    bar.tick();
    if (bar.complete) {
      clearInterval(timer);
    }
  }, 100);
}

program
    .version('The version is: ' + pkg.version)
    .option('-H, --humansize', '[option] -h :  get the size results in Bytes, KB, MB, GB')
    .command('ls [name_of_bucket] ')
    .description("List one or all S3's buckets")
    .action(function list(name_of_bucket){
      if (name_of_bucket){
        if (program.humansize){
          s3.listBucket(name_of_bucket, true);
          progress();
        }
        else {
          s3.listBucket(name_of_bucket, false);
          progress();
        }
      } else { 
        if (program.humansize){
          s3.listAll(true);
          progress();
        }
        else{
          s3.listAll(false);
          progress();
        }
      }
    });

program.parse(process.argv);

