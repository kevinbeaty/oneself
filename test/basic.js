"use strict";
/*globals describe, it*/

var assert = require('assert'),
    oneself = require('..'),
    array = oneself.array,
    map = array.map;

describe('array', function(){
  it('map should convert strings to uppercase', function(){
    listEqual(
      map(['ab', 'cd'], oneself.string.toUpperCase),
      ['AB', 'CD']);
  });

  it('map should map regexp.test_', function(){
    listEqual(
      map([/(.)/, /g$/, /o/, /o$/], oneself.regexp.test_('dog')),
      [true, true, true, false]);
  });

  it('map should push_ on values on each array', function(){
    var a = [[1,2,3], [3,4], [5,6,7]],
        lens = map(a, array.push_(1, 2));
    listEqual(a, [[1,2,3,1,2], [3,4,1,2], [5,6,7,1,2]]);
    listEqual(lens, [5, 4, 5]);
  });

  it('map date should get fullYear', function(){
    listEqual(
      map([new Date(2011, 3, 15), new Date(2012, 5, 25)], oneself.date.getFullYear),
      [2011, 2012]);
  });

  it('filter should remove falsy', function(){
    listEqual(
      array.filter([1, 2, 0, NaN, 4, false, 5, null], Boolean),
      [1, 2, 4, 5]);
  });

  it('should shim string and array', function(){
    oneself.array.shim();
    oneself.string.shim();
    listEqual(
      Array.map(['eB', 'CF'], String.toLowerCase),
      ['eb', 'cf']);
  });

});

describe('anon obj', function(){
  var x = {
    b: 'hi',
    c: function(w){
      return this.b+' '+w+'!';
    },
    a: oneself.curryThis(function(self, cb){
      setTimeout(function(){
        cb(self.b);
      }, 100);
    })
  };

  var y = {
    b: 'bye'
  };

  it('should uncurry this to make function', function(){
    var f = oneself(x.c);
    equal(f(x, 'world'), 'hi world!');
    equal(f(y, 'world'), 'bye world!');
  });

  it('should create _ to invoke on provided self', function(){
    equal(oneself(x.c)._('world')(x), 'hi world!');
    equal(oneself(x.c)._('world')(y), 'bye world!');

    var f = oneself(x.c);
    equal(f._('world')(x), 'hi world!');
    equal(f._('world')(y), 'bye world!');

    f = oneself(x.c)._('world');
    equal(f(x), 'hi world!');
    equal(f(y), 'bye world!');
  });

  it('should curry self', function(done){
    x.a(function(b){
      equal(b, x.b);
      done();
    });
  });

});

describe('Point', function(){
  function Point(x, y){
    this.x = x;
    this.y = y;
  }

  function point(x, y){
    return new Point(x, y);
  }

  Point.prototype.toString = function(){
    return '('+this.x+', '+this.y+')';
  };

  Point.prototype.describe = function(){
    return 'Point '+this.toString();
  };

  Point.prototype.add = function(x, y){
    return new Point(this.x + x, this.y+y);
  };

  Point.prototype.addTuple = function(tuple){
    return this.add(tuple[0], tuple[1]);
  };

  Point.prototype.equals = function(other){
    equal(this.x, other.x);
    equal(this.y, other.y);
  };

  var p1 = point(1,2);

  oneself.shim(Point);

  it('should create func describe', function(){
    var describePoint = oneself(Point.prototype.describe);
    equal(describePoint(p1), p1.describe());
  });

  it('should create func add_', function(){
    var add1_1 = oneself(Point.prototype.add)._(1,1);
    Point.equals(add1_1(p1), point(2, 3));
  });


  it('should shim Point describe', function(){
    equal(Point.describe(p1), p1.describe());
  });

  it('should shim Point toString', function(){
    equal(Point.toString(p1), p1.toString());
  });

  it('should shim func addTuple_', function(){
    var add1_1 = Point.addTuple_([1,1]);
    Point.equals(add1_1(p1), point(2, 3));
  });

  it('should reduce addTuple', function(){
    var sum = array.reduce([[1,2],[3,4]], Point.addTuple, point(0,0));
    sum.equals(point(4, 6));
  });

  it('should map toString', function(){
    listEqual(
      map([point(1,2), point(3,4)], Point.toString),
      ['(1, 2)', '(3, 4)']);
  });

  it('should map add_', function(){
    listEqual(
      map(map([point(1,2), point(3,4)], Point.add_(10, 20)), Point.toString),
      ['(11, 22)', '(13, 24)']);
  });
});

function equal(one, two){
  assert.equal(one, two);
}

function listEqual(one, two){
  assert.deepEqual(one, two);
}

