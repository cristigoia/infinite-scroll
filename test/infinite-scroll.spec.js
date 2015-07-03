describe("InfiniteScroll", function(){

  var loaderSpy,
      parserSpy,
      positionSpy;

  var config,
      infinite;


  fixture.setBase('test/fixtures');


  beforeEach(function(){
    fixture.load('page-1.html');

    loaderSpy   = sinon.spy(window, 'loaderService');
    parserSpy   = sinon.spy(window, 'parserService');
    positionSpy = sinon.spy(window, 'positionService');

    config = {
      autoLoad: true,
      itemSelector: '.post',
      nextSelector: '.pagination__next',
      threshold: 100,
      waitForImages: false
    };

    infinite = infiniteScroll(config);
  });


  afterEach(function(){
    fixture.cleanup();

    loaderSpy.restore();
    parserSpy.restore();
    positionSpy.restore();
  });



  describe("Initializing", function(){
    it("should set `finished` to `true` if next url is not available", function(){
      config.nextSelector = '.no-pagination-element';
      var infinite = infiniteScroll(config);
      expect(infinite.finished()).toBe(true);
    });

    it("should set `finished` to `false` if next url is available", function(){
      expect(infinite.finished()).toBe(false);
    });

    it("should extend self with event emitter functionality", function(){
      ['on', 'addListener', 'emit', 'removeListener'].forEach(function(method){
        expect(infinite[method]).toBeDefined();
      });
    });


    describe("loader", function(){
      it("should invoke loaderService factory", function(){
        expect(loaderSpy.callCount).toBe(1);
      });

      it("should provide loaderService with a parser", function(){
        var parser = parserSpy.returnValues[0];
        expect(loaderSpy.calledWith(parser)).toBe(true);
      });

      it("should provide loaderService with `waitForImages` value", function(){
        expect(loaderSpy.args[0][1]).toBe(config.waitForImages);
      });
    });


    describe("parser", function(){
      it("should invoke parserService factory", function(){
        expect(parserSpy.callCount).toBe(1);
      });

      it("should provide parserService with `itemSelector` and `nextSelector` values", function(){
        expect(parserSpy.calledWith(config.itemSelector, config.nextSelector)).toBe(true);
      });
    });


    describe("position", function(){
      it("should invoke positionService factory", function(){
        expect(positionSpy.callCount).toBe(1);
      });

      it("should provide positionService with `threshold` value", function(){
        expect(positionSpy.args[0][0]).toBe(config.threshold);
      });

      it("should provide positionService with `callback` function", function(){
        expect(typeof positionSpy.args[0][1]).toBe('function');
      });
    });
  });


  describe("Starting infinite-scroll process", function(){
    it("should start watching scroll position", function(){
      var position = positionSpy.returnValues[0];
      sinon.spy(position, 'watch');
      infinite.start();
      expect(position.watch.callCount).toBe(1);
    });
  });


  describe("Stopping infinite-scroll process", function(){
    it("should stop watching scroll position", function(){
      var position = positionSpy.returnValues[0];
      sinon.spy(position, 'stopWatching');
      infinite.stop();
      expect(position.stopWatching.callCount).toBe(1);
    });
  });


  describe("Loading", function(){
    describe("when all pages have not been downloaded", function(){
      it("should invoke loader method", function(){
        var loader = loaderSpy.returnValues[0];
        sinon.spy(loader, 'load');
        infinite.load();
        expect(loader.load.callCount).toBe(1);
      });

      it("should provide loader method with url to be loaded", function(){
        var loader = loaderSpy.returnValues[0];
        sinon.spy(loader, 'load');
        infinite.load();
        expect(loader.load.calledWith('/base/test/fixtures/page-2.html')).toBe(true);
      });

      it("should emit 'load:start' event", function(){
        var listener = sinon.spy();
        infinite.on('load:start', listener).load();
        expect(listener.callCount).toBe(1);
      });
    });


    describe("when `autoLoad` is `false`", function(){
      it("should emit `load:ready` when `autoLoad` is false and scroll position is valid", function(){
        positionSpy.reset();

        config.autoLoad = false;
        var infinite = infiniteScroll(config);

        var listener = sinon.spy();
        infinite.on('load:ready', listener);

        var positionCallback = positionSpy.args[0][1];
        positionCallback();

        expect(listener.callCount).toBe(1);
      });
    });


    describe("when all pages have been downloaded", function(){
      it("should not invoke loader method", function(done){
        var loader = loaderSpy.returnValues[0];
        sinon.spy(loader, 'load');

        infinite.load()
          .then(function(){
            expect(loader.load.callCount).toBe(1);
            return infinite.load();
          })
          .then(function(){
            expect(loader.load.callCount).toBe(2);
            return infinite.load();
          })
          .then(function(){
            expect(loader.load.callCount).toBe(2);
            done();
          });
      });
    });
  });


  describe("Handling response data", function(){
    it("should emit 'load:end' event", function(done){
      var listener = sinon.spy();

      infinite
        .on('load:end', listener)
        .load()
        .then(function(){
          expect(listener.callCount).toBe(1);
          done();
        });
    });

    it("should emit 'load:end' with parsed response data", function(done){
      var listener = function(data, resume){
        expect(data).toBeDefined();
        expect(data.items).toBeDefined();
        expect(data.page).toBeDefined();
        done();
      };

      infinite.on('load:end', listener).load();
    });

    it("should emit 'load:end' with a `resume` callback", function(done){
      sinon.stub(infinite, 'start');

      var listener = function(data, resume){
        expect(typeof resume).toBe('function');
        expect(infinite.start.callCount).toBe(0);
        resume();
        expect(infinite.start.callCount).toBe(1);
        done();
      };

      infinite.on('load:end', listener).load();
    });


    describe("when all pages have not been downloaded", function(){
      it("should update next url", function(done){
        infinite.load().then(function(){
          expect(infinite.nextUrl()).toBe('/base/test/fixtures/page-3.html');
          done();
        });
      });
    });


    describe("when all pages have been downloaded", function(){
      it("should emit 'finished' event", function(done){
        var loader = loaderSpy.returnValues[0];
        sinon.spy(loader, 'load');

        var listener = sinon.spy();
        infinite.on('finished', listener);

        infinite.load() // page-2.html
          .then(function(){
            expect(listener.callCount).toBe(0);
            return infinite.load(); // page-3.html - no more pages
          })
          .then(function(){
            expect(listener.callCount).toBe(1);
            done();
          });
      });

      it("should set `finished` to `true`", function(done){
        var loader = loaderSpy.returnValues[0];
        sinon.spy(loader, 'load');

        infinite.load() // page-2.html
          .then(function(){
            expect(infinite.finished()).toBe(false);
            return infinite.load(); // page-3.html - no more pages
          })
          .then(function(){
            expect(infinite.finished()).toBe(true);
            done();
          });
      });
    });
  });


  describe("Emitter", function(){

    var listener;

    beforeEach(function(){
      listener = sinon.spy();
    });


    it("should add listener to `load:ready` event", function(){
      infinite.on('load:ready', listener);
      expect(infinite.listenerCount('load:ready')).toBe(1);
    });

    it("should add listener to `load:start` event", function(){
      infinite.on('load:start', listener);
      expect(infinite.listenerCount('load:start')).toBe(1);
    });

    it("should add listener to `load:end` event", function(){
      infinite.on('load:end', listener);
      expect(infinite.listenerCount('load:end')).toBe(1);
    });

    it("should add listener to `finished` event", function(){
      infinite.on('finished', listener);
      expect(infinite.listenerCount('finished')).toBe(1);
    });
  });

});
