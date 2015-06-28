describe("InfiniteScroll", function(){

  var config;


  fixture.setBase('test/fixtures');


  beforeEach(function(){
    fixture.load('page-1.html');

    options = {
      container: '.posts',
      item: '.post',
      next: '.pagination__next'
    };
  });


  afterEach(function(){
    fixture.cleanup();
  });


  describe("Constructor", function(){
    it("should set `item` to be `options.item`", function(){
      var infiniteScroll = new InfiniteScroll(options);
      expect(infiniteScroll.itemSelector).toBe(options.item);
    });

    it("should set `nextSelector` to be `options.next`", function(){
      var infiniteScroll = new InfiniteScroll(options);
      expect(infiniteScroll.nextSelector).toBe(options.next);
    });

    it("should set `waitForImages` to be `options.waitForImages`", function(){
      options.waitForImages = false;
      var infiniteScroll = new InfiniteScroll(options);
      expect(infiniteScroll.waitForImages).toBe(false);

      options.waitForImages = true;
      infiniteScroll = new InfiniteScroll(options);
      expect(infiniteScroll.waitForImages).toBe(true);
    });

    it("should set `waitForImages` with default value of `false`", function(){
      var infiniteScroll = new InfiniteScroll(options);
      expect(infiniteScroll.waitForImages).toBe(false);
    });

    it("should set `finished` to `false` if next url is available", function(){
      var infiniteScroll = new InfiniteScroll(options);
      expect(infiniteScroll.finished).toBe(false);
    });

    it("should set `finished` to `true` if next url is not available", function(){
      options.next = '.no-pagination-element';
      var infiniteScroll = new InfiniteScroll(options);
      expect(infiniteScroll.finished).toBe(true);
    });

    it("should set `requestConfig`", function(){
      var infiniteScroll = new InfiniteScroll(options);
      var url = document.querySelector(options.next).getAttribute('href');

      expect(infiniteScroll.requestConfig.context).toBe(infiniteScroll);
      expect(infiniteScroll.requestConfig.dataType).toBe('html');
      expect(infiniteScroll.requestConfig.url).toBe(url);
    });

    it("should set `listener` with instance of Listener", function(){
      var infiniteScroll = new InfiniteScroll(options);
      expect(infiniteScroll.listener instanceof Listener).toBe(true);
    });

    it("should extend self with event emitter functionality", function(){
      var infiniteScroll = new InfiniteScroll(options);

      [
        'on',
        'addListener',
        'emit',
        'removeListener',
        'removeAllListeners',
        'listeners',
        'listenerCount',
        '_getListeners'
      ]
        .forEach(function(method){
          expect(infiniteScroll[method]).toBeDefined();
        });
    });
  });


  describe("Starting", function(){
    it("should start the listener", function(){
      var infiniteScroll = new InfiniteScroll(options);

      sinon.stub(infiniteScroll.listener, 'start');

      infiniteScroll.start();

      expect(infiniteScroll.listener.start.callCount).toBe(1);
    });
  });


  describe("Stopping", function(){
    it("should stop the listener", function(){
      var infiniteScroll = new InfiniteScroll(options);

      sinon.stub(infiniteScroll.listener, 'stop');

      infiniteScroll.stop();

      expect(infiniteScroll.listener.stop.callCount).toBe(1);
    });
  });


  describe("Loading", function(){
    it("should call jQuery.ajax", function(){
      var infiniteScroll = new InfiniteScroll(options);

      sinon.spy($, 'ajax');

      infiniteScroll.load();

      expect($.ajax.callCount).toBe(1);

      $.ajax.restore();
    });

    it("should pass `requestConfig` to jQuery.ajax", function(){
      var infiniteScroll = new InfiniteScroll(options);

      sinon.spy($, 'ajax');

      infiniteScroll.load();

      expect($.ajax.calledWith(infiniteScroll.requestConfig)).toBe(true);

      $.ajax.restore();
    });

    it("should skip jQuery.ajax request when `finished` is `true`", function(){
      var infiniteScroll = new InfiniteScroll(options);
      infiniteScroll.finished = true;

      sinon.spy($, 'ajax');

      infiniteScroll.load();

      expect($.ajax.callCount).toBe(0);

      $.ajax.restore();
    });
  });


  describe("Waiting for images", function(){
    it("should delegate to imagesReady if `waitForImages` is `true`", function(done){
      options.waitForImages = true;
      var infiniteScroll = new InfiniteScroll(options);

      sinon.spy($.fn, 'imagesReady');

      infiniteScroll.load().then(
        function(){
          expect($.fn.imagesReady.callCount).toBe(1);
          done();
        },
        function(){
          expect(false).toBe(true);
          done();
        }
      );
    });
  });


  describe("Extracting pagination URL", function(){
    it("should set `requestConfig.url` with the url of the next page", function(done){
      var infiniteScroll = new InfiniteScroll(options);

      infiniteScroll.requestConfig.url = '/base/test/fixtures/page-2.html';

      infiniteScroll.load().then(
        function(){
          expect(infiniteScroll.requestConfig.url).toBe('/base/test/fixtures/page-3.html');
          done();
        },
        function(){
          expect(false).toBe(true);
          done();
        }
      );
    });

    it("should set `finished` to `true` if next url selector yields 0 elements", function(done){
      var infiniteScroll = new InfiniteScroll(options);

      infiniteScroll.requestConfig.url = '/base/test/fixtures/page-3.html';
      infiniteScroll.finished = false;

      infiniteScroll.load().then(
        function(){
          expect(infiniteScroll.finished).toBe(true);
          done();
        },
        function(){
          expect(false).toBe(true);
          done();
        }
      );
    });
  });


  describe("Emitting events", function(){
    it("should add listener to `load:ready` event", function(){
      var infiniteScroll = new InfiniteScroll(options);
      var listener = function(){};

      infiniteScroll.on('load:ready', listener);

      expect(infiniteScroll.listenerCount('load:ready')).toBe(1);
    });

    it("should add listener to `load:start` event", function(){
      var infiniteScroll = new InfiniteScroll(options);
      var listener = function(){};

      infiniteScroll.on('load:start', listener);

      expect(infiniteScroll.listenerCount('load:start')).toBe(1);
    });

    it("should add listener to `load:end` event", function(){
      var infiniteScroll = new InfiniteScroll(options);
      var listener = function(){};

      infiniteScroll.on('load:end', listener);

      expect(infiniteScroll.listenerCount('load:end')).toBe(1);
    });

    it("should emit `load:ready` when `autoLoad` is false and scroll position is in active zone", function(){
      options.autoLoad = false;
      var infiniteScroll = new InfiniteScroll(options);
      var listenerStub = sinon.stub();
      var loadSpy = sinon.spy(infiniteScroll, 'load');

      infiniteScroll.on('load:ready', listenerStub);
      infiniteScroll.listener.callback();

      expect(listenerStub.calledOnce).toBe(true);
      expect(loadSpy.callCount).toBe(0);
    });

    it("should emit when load cycle has started", function(){
      var infiniteScroll = new InfiniteScroll(options);
      var listenerStub = sinon.stub();

      infiniteScroll.on('load:start', listenerStub);
      infiniteScroll.load();

      expect(listenerStub.calledOnce).toBe(true);
    });

    it("should emit when load cycle has ended", function(done){
      var infiniteScroll = new InfiniteScroll(options);
      var listenerStub = sinon.stub();

      sinon.stub(infiniteScroll, 'start');

      infiniteScroll.on('load:end', listenerStub);

      infiniteScroll.load().then(
        function(){
          expect(listenerStub.calledOnce).toBe(true);
          done();
        },
        function(){
          console.log(arguments);
          expect(false).toBe(true);
          done();
        }
      );
    });
  });

});
