'use strict';

const _ = require('lodash');
const async = require('async');
const readJsonSync = require('read-json-sync');
const fs = require('fs');

module.exports = syncJson;

function syncJson( src, dst, props, callback, progress ){
  var srcObj;
  // src param typecheck
  if(!src) return callback();
  if(typeof src === 'string') srcObj = readJsonSync(src);
  else if(typeof src === 'object') srcObj = src;
  else {
    let msg = 'Parameter "src" must be a string or an object, not '
	+ typeof src;
    throw new TypeError(msg);
  }
  // dst param typecheck
  if(typeof dst === 'string') dst = [dst];
  else if(!Array.isArray(dst)){
    let msg = 'Parameter "dst" must be a string or an array, not '
	+ typeof dst;
    throw new TypeError(msg);
  }
  // props param typecheck
  if(typeof props === 'string') props = srcObj[props];
  if(!props) props = Object.keys(srcObj); // defaults
  else if(typeof props === 'function'){
    // if props is not specified, params shift left
    progress = callback;
    callback = props;
    props = Object.keys(srcObj);
  }
  else if(!Array.isArray(props)){
    let msg = 'Parameter "props" of unrecognized type '
	+ typeof props;
    throw new TypeError(msg);
  }
  // callback param typecheck
  if(typeof callback !== 'function'){
    let msg = 'Parameter "callback" must be a function, not '
	+ typeof callback;
    throw new TypeError(msg);
  }
  // progress param typecheck
  if(typeof progress !== 'function' && typeof progress !== 'undefined'){
    let msg = 'Parameter "progress" must be a function or undefined, not '
	+ typeof progress;
    throw new TypeError(msg);
  }

  const toSync = _.pick( srcObj, props );
  let foptions = {
    encoding: 'utf8',
    mode: 0o644,
    flag: 'w'
  };

  // Updating dst files
  async.each(dst, syncDstFile, callback);

  function syncDstFile( dstFile, cb ){
    let dstObj;
    let notify;
    if(!progress) notify = cb;
    else {
      notify = (err) => {
	progress(err, dstFile);
	cb(err);
      };
    }
    try{
      dstObj = readJsonSync( dstFile );
      Object.assign( dstObj, toSync );
    } catch( err ){
      if(err.code === 'ENOENT') dstObj = toSync;
      else throw err;
    }
    
    var dstContent = JSON.stringify( dstObj, null, 2 );
    fs.writeFile( dstFile, dstContent, foptions, notify );
  }
}
