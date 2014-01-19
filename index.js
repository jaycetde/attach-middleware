var slice = Array.prototype.slice;

module.exports = attachMiddleware;

function attachMiddleware(obj, options) {
    
    options = options || {};
    
    var runName = options.runName || 'run'
      , useName = options.useName || 'use'
    ;
    
    obj[runName] = run;
    obj[useName] = use;
    
}

function run() {
    
    this._middlewareStack = this._middlewareStack || [];
    
    var self = this
      , args = slice.call(arguments)
      , callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
      , applyArgs = args.concat([next])
      , l = self._middlewareStack.length
      , i = -1
    ;

    function next(err) {
        
        i += 1;
        
        var stackApplyArgs = applyArgs // do I need to .slice() this?
          , nextStackFn = self._middlewareStack[i]
          , isErrHandler = nextStackFn ? nextStackFn.length > stackApplyArgs.length : true
        ;

        if (!nextStackFn) {
            nextStackFn = callback;
            stackApplyArgs.pop(); // remove `next`. Affects `applyArgs`, but should be last run
        }
            
        // replace applyArgs with arguments
        if (arguments.length > 1) {
            var args = slice.call(arguments);
            args.shift(); // remove err argument
            stackApplyArgs = args.concat(stackApplyArgs.slice(args.length)); // add left out applyArgs
        }
        
        if (isErrHandler) {
            stackApplyArgs = [ err ].concat(stackApplyArgs);
        } else if (err) {
            // don't run this middleware
            return next(err);
        }
        
        process.nextTick(function () {
            nextStackFn.apply(self, stackApplyArgs);
        });

    }

    process.nextTick(next);
    
    return this;
    
}

function use(fn) {
    
    if (arguments.length > 1)
        fn = slice.call(arguments);
    
    if (Object.prototype.toString.call(fn) === '[object Array]') {
        var self = this;
        fn.forEach(function (fn) {
            use.call(self, fn);
        });
        return this;
    }
    
    this._middlewareStack = this._middlewareStack || [];
    
    this._middlewareStack.push(fn);
    
    return this;
    
}