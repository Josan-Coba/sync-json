'use strict';

const _ = require('lodash');
const glob = require('glob').sync;
const fs = require('fs');
const path = require('path');
const fixture = path.join.bind(path, __dirname, 'fixtures');

describe('sync-json', function(){
  const syncJson = require('..');

  const cp = require('cp');
  const readJsonSync = require('read-json-sync');

  const srcPath = fixture('src.orig.json');
  const dstOrig = fixture('dst.orig.json');;
  let src;
  let dst;
  let props;

  beforeEach(function(){
    src = srcPath;
    dst = fixture('dst.delete-me.json');
    props = ['name', 'version', 'keywords'];
    cp.sync(dstOrig, dst);
  });

  afterEach(cleanup);

  it('should modify dst file if is not in sync', function(done){
    let dstContentBefore = fs.readFileSync(dst);
    syncJson(src, dst, props, function(err){
      if(err) return done(err);
      let dstContentAfter = fs.readFileSync(dst);
      
      expect(dstContentAfter).not.toEqual(dstContentBefore);
      
      done();
    });
  });

  it('should not modify other files', function(done){
    let dstOrigContentBefore = fs.readFileSync(dstOrig);
    syncJson(src, dst, props, function(err){
      if(err) return done(err);
      let dstOrigContentAfter = fs.readFileSync(dstOrig);
      
      expect(dstOrigContentAfter).toEqual(dstOrigContentBefore);
      
      done();
    });
  });

  it('should keep specified properties in sync', function(done){
    syncJson(src, dst, props, function(err){
      if(err) return done(err);
      let srcObj = readJsonSync(src);
      let dstObj = readJsonSync(dst);
      let pattern = _.pick(srcObj, props);
      
      expect(dstObj).toEqual(jasmine.objectContaining(pattern));

      done();
    });
  });

  it('should not modify other properties in dst file', function(done){
    syncJson(src, dst, props, function(err){
      if(err) return done(err);
      let dstObj = readJsonSync(dst);
      let dstOrigObj = readJsonSync(dstOrig);
      let unsyncedProps = _.difference(Object.keys(dstOrigObj), props);
      let pattern = _.pick(dstOrigObj, unsyncedProps);
      
      expect(dstObj).toEqual(jasmine.objectContaining(pattern));
      
      done();
    });
  });

  describe('when a source object is provided directly', function(){
    beforeEach(function(){
      src = {};
    });

    it('should use the object as the source to sync', function(done){
      src = readJsonSync(srcPath);
      syncJson(src, dst, props, function(err){
	if(err) return done(err);
	let dstObj = readJsonSync(dst);
	let pattern = _.pick(src, props);

	expect(dstObj).toEqual(jasmine.objectContaining(pattern));

	done();
      });
    });

    it('should not modify dst if source object is null', function(done){
      src = null;
      syncJson(src, dst, props, function(err){
	if(err) return done(err);
	let dstContent = fs.readFileSync(dst);
	let dstOrigContent = fs.readFileSync(dstOrig);

	expect(dstContent).toEqual(dstOrigContent);

	done();
      });
    });
  });

  describe('when properties are specified in the source', function(){
    beforeEach(function(){
      props = '__sync';
    });

    it('should read them as an array and sync', function(done){
      syncJson(src, dst, props, function(err){
	if(err) return done(err);
	let srcObj = readJsonSync(src);
	let dstObj = readJsonSync(dst);
	let pattern = _.pick(srcObj, srcObj[props]);

	expect(dstObj).toEqual(jasmine.objectContaining(pattern));
	expect(dstObj[props]).not.toEqual(srcObj[props]);

	done();
      });
    });
  });

  describe('when properties to sync are not specified', function(){
    beforeEach(function(){
      props = undefined;
    });
    
    it('should keep all the source properties in sync', function(done){
      syncJson(src, dst, function(err){
	if(err) return done(err);
	let srcObj = readJsonSync(src);
	let dstObj = readJsonSync(dst);

	expect(dstObj).toEqual(jasmine.objectContaining(srcObj));
	
	done();
      });
    });
  });

  describe('when a property is not set in source', function(){
    let undefinedProp;
    
    beforeEach(function(){
      undefinedProp = 'bin';
      props.push(undefinedProp);
    });

    it('should not alter that property in dst', function(done){
      let dstOrigObj = readJsonSync(dstOrig);
      syncJson(src, dst, props, function(err){
	if(err) return done(err);
	let dstObj = readJsonSync(dst);
      
	expect(dstObj[undefinedProp]).toEqual(dstOrigObj[undefinedProp]);

	done();
      });      
    });
  });

  describe('when called with a non-existant dst file', function(){
    beforeEach(function(){
      dst = fixture('non-existant.delete-me.json');
      cleanup();
    });
    
    it('should create a new one with specified props', function(done){
      syncJson(src, dst, props, function(err){
	if(err) return done(err);
	let srcObj = readJsonSync(src);
	let dstObj = readJsonSync(dst);
	
	expect(srcObj).toEqual(jasmine.objectContaining(dstObj));
	
	done();
      });
    });
  });

  describe('when called with multiple dst files', function(){
    beforeEach(function(){
      dst = [dst];
      dst.push(fixture('dst-1.delete-me.json'));
      dst.push(fixture('dst-2.delete-me.json'));
      cp.sync(dstOrig, dst[1]);
    });

    it('should sync against all dst files', function(done){
      syncJson(src, dst, props, function(err){
	if(err) return done(err);
	let srcObj = readJsonSync(src);
	let dstObjMap = _.map(dst, _.ary(readJsonSync, 1));
	let pattern = _.pick(srcObj, props);
	_.forEach(dstObjMap, function(dstObj){
	  expect(dstObj).toEqual(jasmine.objectContaining(pattern));
	});
	done();
      });
    });
  });
});

function cleanup(){
  let files = glob(fixture('*.delete-me.*'));
  _.forEach(files, function(file){
    fs.unlinkSync(file);
  });
}
