# attach-middleware

Attach middleware functionality onto an object

```javascript

var attachMiddleware = require('attach-middleware')
  , x = {}
;

attachMiddleware(x, { useName: 'addMiddleware', runName: 'runMiddleware' });

x.addMiddleware(function (obj, next) {
    console.log(obj);
    obj.firstMiddleware = true;
    next();
});

x.addMiddleware(function (obj, next) {
    console.log(obj);
    obj.secondMiddleware = true;
    next();
});

x.runMiddleware({ hello: 'world' });
// { hello: 'world' }
// { hello: 'world', firstMiddleware: true }

```

## Installation

    $ npm install attach-middleware

## Dependencies

  - [fast-apply](https://npmjs.org/package/fast-apply)

## API

### attachMiddleware(obj, [options])

Attach a `use` method and `run` method onto an object to enable middleware functionality

* obj - An object to attach the methods.  The object may be a constructor's prototype or a plain object
* options
    * useName - Specify the name for the `use` method (default: 'use')
    * runName - Specify the name for the `run` method (default: 'run')

### .use(fn*)

Add a middleware function to the 'stack'

If the function accepts more arguments than sent through `run` + 1, than it will be treated as error handling
middleware and the first argument will be an error.

If the function does not accept extra arguments and an error has occurred, than it will be bypassed

```javascript

var obj = {};

attachMiddleware(obj);

obj.use(function (arg1, arg2, next) {

    next('error');
    
});

obj.use(function (err, arg1, arg2, next) {
    
    console.log(err); // 'error'
    
});

obj.run('foo', 'bar');

```

returns `this`

### .run(args*, [callback])

Send arguments through the middleware stack

If the last argument is a function, it is treated as a callback.  This function should accept an err
and all arguments passed to `.run` (except the callback function)

returns `this`

### next

The `next` or `callback` function passed to each middleware must be called to run the next middleware and
eventually, the callback.  When calling `next`, the first argument should be an error or null.  Any
additional arguments will overwrite the arguments for the rest of the middleware:

```javascript

var obj = {};

attachMiddleware(obj);

obj.use(function (arg1, arg2, next) {

    console.log(arg1, arg2); // 'foo', 'bar'

    next(null, 'baz');
    
});

obj.use(function (err, arg1, arg2, next) {
    
    console.log(err, arg1, arg2); // null, 'baz', 'bar'
    
});

obj.run('foo', 'bar');

```