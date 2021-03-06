[![Build Status](https://secure.travis-ci.org/kevinbeaty/oneself.png)](http://travis-ci.org/kevinbeaty/oneself)

Oneself turns methods into functions with an explicit self.

So instead of writing:

```javascript
Array.prototype.slice.call(arguments, 1);
```

you can create a reusable function that takes `this` as the first parameter.


```javascript
var slice = oneself(Array.prototype.slice);
...
slice(arguments, 1)
```

As a convenenience, `oneself` provides all `Array` methods
as functions under `oneself.array`, along with functions
in `string`, `date`, `regexp` and `object`.

```javascript
var slice = oneself.array.slice;
...
slice(arguments, 1)

var map = oneself.array.map,
    getFullYear = oneself.date.getFullYear;
listEqual(
  map([new Date(2011, 3, 15), new Date(2012, 5, 25)], getFullYear),
  [2011, 2012]);
```

If desired, you can extend the object itself:

```javascript
oneself.array.shim();
oneself.string.shim();

listEqual(
  Array.map(['eB', 'CF'], String.toLowerCase),
  ['eb', 'cf']);

```

As shown above, these functions are useful to map `this` over
collections of objects. `oneself` also provides placeholder functions
that allow you to map methods with specified arguments, named
the same as the methods, with a `_` suffix.

```javascript
listEqual(
  map([/(.)/, /g$/, /o/, /o$/], oneself.regexp.test_('dog')),
  [true, true, true, false]);
```

### Objects
You can create functions from any object as an alternative to binding
`this`.

```javascript
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

  var p1 = point(1,2);


  var describePoint = oneself(Point.prototype.describe);
  equal(describePoint(p1), p1.describe());
```

As well as placeholder functions:

```javascript
var add1_1 = oneself(Point.prototype.add)._(1,1);
equals(add1_1(p1), point(2, 3));
```

Although it might be better to shim your objects. This
will create functions for all enumerable methods
along with `toString`.

```javascript
oneself.shim(Point);

listEqual(
  map(map([point(1,2), point(3,4)], Point.add_(10, 20)), Point.toString),
  ['(11, 22)', '(13, 24)']);
```

### (un)curryThis

`oneself` makes use of `uncurryThis`, [described here][1],
which  is also available under `oneself.uncurryThis`

The companion, `curryThis`,  can be used to avoid `that = this`:

```javascript
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

  x.a(function(b){});
```

[1]: http://www.2ality.com/2011/11/uncurrying-this.html
