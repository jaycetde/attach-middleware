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
    
    var self = this
      , args = slice.call(arguments)
      , applyArgs = args.concat([next])
      , l = self._middlewareStack.length
      , i = -1
    ;

    function next(err) {
        
        i += 1;
        
        var stackApplyArgs = applyArgs
          , isErrHandler = self._middlewareStack[i].length > applyArgs.length
        ;

        if (i < l) {
            
            // replace applyArgs with arguments
            if (arguments.length > 1) {
                var args = slice.call(arguments);
                args.shift(); // remove err argument
                stackApplyArgs = args.concat(applyArgs.slice(args.length)); // add left out applyArgs
            }
            
            if (isErrHandler) {
                stackApplyArgs = [ err ].concat(stackApplyArgs);
            } else if (err) {
                // don't run this middleware
                return next(err);
            }
            
            process.nextTick(function () {
                self._middlewareStack[i].apply(self, stackApplyArgs);
            });

        }

    }

    process.nextTick(next);
    
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
    
    if (!this._middlewareStack) {
        this._middlewareStack = [];
    }
    
    this._middlewareStack.push(fn);
    
}