var fastApply = require('fast-apply');

module.exports = attachMiddleware;

function attachMiddleware(obj, options) {
    
    options = options || {};
    
    var runName = options.runName || 'run'
      , useName = options.useName || 'use'
      , stackName = options.stackName || '_' + runName + 'Stack'
    ;
    
    obj[runName] = function () {
        
        this[stackName] = this[stackName] || [];
        
        var self = this
          , args = fastApply(Array, null, arguments)
          , callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
          , applyArgs = args.concat([next])
          , l = self[stackName].length
          , i = -1
        ;
    
        function next(err) {
            
            i += 1;
            
            var stackApplyArgs = applyArgs // do I need to .slice() this?
              , nextStackFn = self[stackName][i]
              , isErrHandler = nextStackFn ? nextStackFn.length > stackApplyArgs.length : true // callback will always be an error handler
            ;
    
            // no more functions in the stack
            if (!nextStackFn) {
                if (!callback) return; // no callback, stop
                nextStackFn = callback; // use callback as next function
                stackApplyArgs.pop(); // remove `next`. Affects `applyArgs`, but should be last run
            }
                
            // replace applyArgs with arguments
            if (arguments.length > 1) {
                var args = fastApply(Array, null, arguments); // convert `arguments` into an Array
                args.shift(); // remove err argument
                stackApplyArgs = args.concat(stackApplyArgs.slice(args.length)); // add remaining applyArgs
            }
            
            if (isErrHandler) {
                stackApplyArgs = [ err ].concat(stackApplyArgs); // add in the error 
            } else if (err) {
                // don't run this middleware
                return next(err);
            }
            
            fastApply(nextStackFn, self, stackApplyArgs);
    
        }
    
        // start running the stack
        next();
        
        return this;
        
    };
    
    obj[useName] = function (fn) {
        
        if (arguments.length > 1)
            fn = fastApply(Array, null, arguments);
        
        if (Object.prototype.toString.call(fn) === '[object Array]') {
            var self = this;
            fn.forEach(function (fn) {
                obj[useName](fn);
            });
            return this;
        }
        
        this[stackName] = this[stackName] || [];
        
        this[stackName].push(fn);
        
        return this;
        
    };
    
}