#!/usr/bin/env node

'use strict';

const syncJson = require('..');
const _ = require('lodash');
const logSymbols = require('log-symbols');
const path = require('path');

// Command line options processing
const argv = require('yargs')
      .usage('Usage: $0 [-p property] -s <source> <dest-files...>')
      .option('p', {
	alias: 'property',
	demand: false,
	describe: 'Each property to synchronize from source',
	nargs: 1,
	requiresArg: true,
	type: 'string'
      })
      .option('s', {
	alias: 'source',
	demand: true,
//	default: 'package.json',
	describe: 'Source file',
	nargs: 1,
	normalize: true,
	requiresArg: true,
	type: 'string'
      })
      .demand(1)
      .help('h')
      .alias('h', 'help')
      .version()
      .strict()
      .argv;

let src = argv.source;
let dst = _.map(argv._, path.normalize);
let props = argv.property;
function callback(err){
  if(err) throw err;
  console.log('Successfully synchronised');
}
function progress(err, dstFile){
  if(!err) console.log('', logSymbols.success, dstFile);
}

console.log('Synchronising [' + props + '] from '
	    + (src === '-' ? 'STDIN' : src)
	    + '...');

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
