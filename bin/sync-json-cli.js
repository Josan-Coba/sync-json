#!/usr/bin/env node

'use strict';

const syncJson = require('..');
const _ = require('lodash');
const logSymbols = require('log-symbols');
const path = require('path');

// Command line options processing
const argv = require('yargs')
      .usage('Usage: $0 [-p <property> | -i <field>] -s <source> <dest-files...>')
      .pkgConf('sync', process.cwd())
      .option('s', {
	alias: 'source',
	demand: true,
	describe: 'Source file',
	nargs: 1,
	normalize: true,
	requiresArg: true,
	type: 'string'
      })
      .option('t', {
	alias: 'targets',
	demand: false,
	describe: 'Target file(s)',
	normalize: true,
	requireArg: true,
	type: 'array'
      })
      .group(['s', 't'], 'Files to sync:')
      .option('p', {
	alias: ['property', 'properties'],
	demand: false,
	describe: 'Each property to sync from source',
	nargs: 1,
	requiresArg: true,
	type: 'string'
      })
      .option('i', {
	alias: 'implicit',
	demand: false,
	describe: 'Replaces "-p". Read the properties from a field of source'
      })
      .group(['p','i'], 'Properties to sync:')
      .option('v', {
	alias: 'verbose',
	describe: 'Output messages on success',
	type: 'boolean'
      })
      .help('h')
      .alias('h', 'help')
      .version()
      .strict()
      .check(excludes('p', 'i'))
      .check(targetsPresent)
      .argv;

let src = argv.source;
let dst = argv.targets;
let props = processProps(argv);
function callback(err){
  if(err) throw err;
  if(argv.verbose){
    console.log('Successfully synchronised');
  }
}
function progress(err, dstFile){
  if(!err && argv.verbose){
    console.log('', logSymbols.success, dstFile);
  }
}

if(argv.verbose){
console.log('Synchronising [' + props + '] from '
	    + (src === '-' ? 'STDIN' : src)
	    + '...');
}

if(src === '-'){
  src = 'STDIN';
  readFromStdin(function(err, data){
    if(err) throw err;
    syncJson(data, dst, props, callback, progress);
  });
}
else {
  syncJson(src, dst, props, callback, progress);
}

function readFromStdin(callback){
  let str = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => str += chunk);
  process.stdin.on('error', (err) => callback(err));
  process.stdin.on('end', () => callback(null, str));
}

function processProps(argv){
  let props;
  if(typeof argv.implicit === 'string'){
    props = argv.implicit;
  }
  else if(argv.implicit === true){
    props = '__sync';
    if(argv.verbose){
      let msg = 'Found "--implicit" flag set but no field specified'
	  + ' using "' + props + '" as default origin';
      console.warn(msg);
    }
  }
  else if(typeof argv.property === 'string'){
    props = [argv.property];
  }
  else props = argv.property;
  
  return props;
}

/* ARGV checks */
function excludes(...opts){
  return function exclusionCheck(argv, options){
    let n = _(opts)
	.map(_.propertyOf(argv))
	.filter()
	.size();
    if(n > 1){
      let displayOpts = _.map(opts, (o) => '"-' + o + '"');
      let errorMsg = 'More than one mutually exclusive option'
	  + ' in the set of [' + displayOpts + ']'
	  + ' has been specified.'
      throw new Error(errorMsg);
    }
    return true;
  }
}

function targetsPresent(argv, options){
  let targets = (argv.targets || []).concat(argv._);
  if(!targets.length){
    let errorMsg = 'No target file specified';
    throw new Error(errorMsg);
  }
  argv.targets = targets;
  return true;
}
