(function(define){'use strict'; define(function(){

function ut(fn){
  var f = uncurry(fn);
  f._ = invoke(fn);
  return f;
}

var _call = Function.call,
    _slice = Array.prototype.slice;

ut.uncurry = uncurry;
function uncurry(fn){
  return function(){
    return _call.apply(fn, arguments);
  };
}

ut.curry = curry;
function curry(fn){
  return function(){
    var args = _slice.call(arguments);
    args.unshift(this);
    return fn.apply(null, args);
  };
}

function invoke(fn){
  return function(){
    var args = _slice.call(arguments);
    return function(self){
      return fn.apply(self, args);
    };
  };
}

ut.shim = shim;
function shim(obj){
  var props = _slice.call(arguments, 1);
  return generify(obj, {shim:true, props:props});
}

function generify(obj, opts){
  opts = opts || {};
  var shim = opts.shim,
      g = shim ? obj : {},
      proto = opts.proto || obj.prototype,
      props = (opts.props && opts.props.length) ? opts.props : methods(proto),
      i = 0, len = props.length,
      fn, prop;

  for(; i < len; ++i){
    prop = props[i];
    fn = ut(proto[prop]);

    g[prop] = fn;
    g[prop+'_'] = fn._;
  }
  return g;
}

function methods(proto){
  var meths = ['toString'], meth, fn;
  for(meth in proto){
    fn = proto[meth];
    if(ut.object.toString(fn) === '[object Function]'){
      meths.push(meth);
    }
  }
  return meths;
}

function mixin(obj, props){
  var o = generify(obj, {props: props});

  o.shim = function(){
    return generify(obj, {shim: true, props: props});
  };

  return o;
}

ut.array = mixin(Array, [
  'pop','push','reverse','shift','sort','splice','unshift', 'concat',
  'join', 'slice', 'indexOf', 'lastIndexOf',  'toString',
  'forEach', 'every', 'some', 'filter', 'map', 'reduce', 'reduceRight']);

ut.date = mixin(Date, [
  'getDate', 'getDay', 'getFullYear', 'getHours', 'getMilliseconds',
  'getMinutes', 'getMonth', 'getSeconds', 'getTime', 'getTimezoneOffset',
  'getUTCDate', 'getUTCDay', 'getUTCFullYear', 'getUTCHours',
  'getUTCMilliseconds', 'getUTCMinutes', 'getUTCMonth', 'getUTCSeconds',
  'setDate', 'setFullYear', 'setHours', 'setMilliseconds', 'setMinutes',
  'setMonth', 'setSeconds', 'setTime', 'setUTCDate', 'setUTCFullYear',
  'setUTCHours', 'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth',
  'setUTCSeconds', 'toDateString', 'toISOString', 'toJSON',
  'toLocaleDateString', 'toLocaleString', 'toLocaleTimeString',
  'toString', 'toTimeString', 'toUTCString', 'valueOf']);

ut.regexp = mixin(RegExp, ['exec', 'test', 'toString']);

ut.object = mixin(Object, [
  'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toString']);

ut.string = mixin(String, [
  'quote', 'substring', 'toLowerCase', 'toUpperCase', 'charAt',
  'charCodeAt', 'indexOf', 'lastIndexOf', 'startsWith', 'endsWith',
  'trim', 'trimLeft', 'trimRight', 'toLocaleLowerCase', 'toString',
  'toLocaleUpperCase', 'localeCompare', 'match', 'search', 'replace',
  'split', 'substr', 'concat', 'slice', 'fromCharCode']);

// Boilerplate for AMD, Node, and browser global
return ut;
});})(typeof define === 'function' && define.amdi ? define :
function(factory){
  'use strict';
  if(typeof exports === 'object'){
    module.exports = factory();
  } else {
    this.oneself = factory();
  }
});
