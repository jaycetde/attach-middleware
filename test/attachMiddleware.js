var attachMiddleware = require('..')
  , should = require('should')
;

function Instance() {}

describe('attach-middleware', function () {
    
    it('should attach middleware using the default method names', function () {
        
        var obj = {};
        
        attachMiddleware(obj);
        
        obj.use.should.exist;
        obj.run.should.exist;
        
    });
    
    it('should attach middleware using custom method names', function () {
        
        var obj = {};
        
        attachMiddleware(obj, { useName: 'useMiddleware', runName: 'runMiddleware' });
        
        should(obj.use).not.exist;
        should(obj.run).not.exist;
        
        obj.useMiddleware.should.exist;
        obj.runMiddleware.should.exist;
        
    });
    
    it('should run all middleware in the stack', function (done) {
        
        var obj = {}
          , middlewareCount = 0
        ;
        
        attachMiddleware(obj);
        
        obj.use(function (o, next) {
            
            middlewareCount += 1;
            
            middlewareCount.should.equal(1);
            
            o.should.eql({ hello: 'world' });
            
            o.firstMiddleware = true;
            
            next();
            
        });
        
        obj.use(function (o, next) {
            
            middlewareCount += 1;
            
            middlewareCount.should.equal(2);
            
            o.should.eql({ hello: 'world', firstMiddleware: true });
            
            o.secondMiddleware = true;
            
            next();
            
        });
        
        obj.use(function (o) {
            
            middlewareCount += 1;
            
            middlewareCount.should.equal(3);
            
            o.should.eql({ hello: 'world', firstMiddleware: true, secondMiddleware: true });
            
            done();
            
        });
        
        obj.run({ hello: 'world' });
        
    });
    
    it('should work as an constructors prototype', function (done) {
        
        attachMiddleware(Instance.prototype);
        
        var obj = new Instance();
        
        obj.use.should.exist;
        obj.run.should.exist;
        
        obj.use(function (arg, next) {
            
            arg.should.equal('foo');
            
            done();
            
        });
        
        obj.run('foo');
        
    });
    
    it('should handle errors', function (done) {
        
        var obj = {}
          , middlewareCount = 0
        ;
        
        attachMiddleware(obj);
        
        obj.use(function (o, next) {
            
            middlewareCount += 1;
            
            middlewareCount.should.equal(1);
            
            next();
            
        });
        
        obj.use(function (err, o, next) {
            
            should(err).not.exist;
            
            middlewareCount += 1;
            
            middlewareCount.should.equal(2);
            
            next('an error occurred');
            
        });
        
        obj.use(function (o, next) {
            
            throw new Error('This middleware should not run');
            
        });
        
        obj.use(function (err, o, next) {
            
            err.should.equal('an error occurred');
            
            middlewareCount += 1;
            
            middlewareCount.should.equal(3);
            
            done();
            
        });
        
        obj.run({});
        
    });
    
    it('should handle multiple arguments', function (done) {
        
        var obj = {}
          , middlewareCount = 0
        ;
        
        attachMiddleware(obj);
        
        obj.use(function (arg1, arg2, next) {
            
            middlewareCount += 1;
            
            middlewareCount.should.equal(1);
            
            arg1.should.eql({ hello: 'world' });
            arg2.should.eql({ foo: 'bar' });
            
            arg1.firstMiddleware = true;
            arg2.baz = 'qux';
            
            next();
            
        });
        
        obj.use(function (arg1, arg2, next) {
            
            middlewareCount += 1;
            
            middlewareCount.should.equal(2);
            
            arg1.should.eql({ hello: 'world', firstMiddleware: true });
            arg2.should.eql({ foo: 'bar', baz: 'qux' });
            
            done();
            
        });
        
        obj.run({ hello: 'world' }, { foo: 'bar' });
        
    });
    
    it('should replace the arguments if specified in `next', function (done) {
        
        var obj = {}
          , middlewareCount = 0
        ;
        
        attachMiddleware(obj);
        
        obj.use(function (arg1, arg2, next) {
            
            middlewareCount += 1;
            
            middlewareCount.should.equal(1);
            
            arg1.should.equal('foo');
            arg2.should.equal('bar');
            
            next(null, 'baz');
            
        });
        
        obj.use(function (arg1, arg2, next) {
            
            middlewareCount += 1;
            
            middlewareCount.should.equal(2);
            
            arg1.should.equal('baz');
            arg2.should.equal('bar');
            
            done();
            
        });
        
        obj.run('foo', 'bar');
        
    });
    
    it('should call `run`s `callback` after stack has ran', function (done) {
        
        var obj = {}
          , middlewareCount = 0
        ;
        
        attachMiddleware(obj);
        
        obj.use(function (arg1, arg2, next) {
            
            middlewareCount += 1;
            
            middlewareCount.should.equal(1);
            
            next();
            
        });
        
        obj.use(function (arg1, arg2, next) {
            
            middlewareCount += 1;
            
            middlewareCount.should.equal(2);
            
            next('error')
            
        });
        
        obj.run('foo', 'bar', function (err, arg1, arg2) {
            
            arguments.length.should.equal(3);
            
            err.should.equal('error');
            
            arg1.should.equal('foo');
            arg2.should.equal('bar');
            
            done();
            
        });
        
    });
    
});