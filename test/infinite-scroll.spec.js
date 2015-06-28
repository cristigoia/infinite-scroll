describe("InfiniteScroll", function(){

  var config;


  fixture.setBase('test/fixtures');


  beforeEach(function(){
    fixture.load('page-1.html');

    config = {
      container: '.posts',
      item: '.post',
      pagination: '.pagination__next'
    };
  });


  afterEach(function(){
    fixture.cleanup();
  });


  describe("Constructor", function(){
    it("should set `item` to be `options.item`", function(){
      var infiniteScroll = new InfiniteScroll(config);
      expect(infiniteScroll.itemSelector).toBe(config.item);
    });

    it("should set `pagination` to be `options.pagination`", function(){
      var infiniteScroll = new InfiniteScroll(config);
      expect(infiniteScroll.paginationSelector).toBe(config.pagination);
    });

    it("should set `waitForImages` to be `options.waitForImages`", function(){
      config.waitForImages = false;
      var infiniteScroll = new InfiniteScroll(config);
      expect(infiniteScroll.waitForImages).toBe(false);

      config.waitForImages = true;
      infiniteScroll = new InfiniteScroll(config);
      expect(infiniteScroll.waitForImages).toBe(true);
    });

    it("should set `waitForImages` with default value of `false`", function(){
      var infiniteScroll = new InfiniteScroll(config);
      expect(infiniteScroll.waitForImages).toBe(false);
    });

    it("should set `finished` to be `false`", function(){
      var infiniteScroll = new InfiniteScroll(config);
      expect(infiniteScroll.finished).toBe(false);
    });

    it("should set `requestConfig`", function(){
      var infiniteScroll = new InfiniteScroll(config);
      var url = document.querySelector(config.pagination).getAttribute('href');

      expect(infiniteScroll.requestConfig.context).toBe(infiniteScroll);
      expect(infiniteScroll.requestConfig.dataType).toBe('html');
      expect(infiniteScroll.requestConfig.url).toBe(url);
    });

    it("should set `listener` with instance of Listener", function(){
      var infiniteScroll = new InfiniteScroll(config);
      expect(infiniteScroll.listener instanceof Listener).toBe(true);
    });

    it("should extend self with event emitter functionality", function(){
      var infiniteScroll = new InfiniteScroll(config);

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
      var infiniteScroll = new InfiniteScroll(config);

      sinon.stub(infiniteScroll.listener, 'start');

      infiniteScroll.start();

      expect(infiniteScroll.listener.start.callCount).toBe(1);
    });
  });


  describe("Stopping", function(){
    it("should stop the listener", function(){
      var infiniteScroll = new InfiniteScroll(config);

      sinon.stub(infiniteScroll.listener, 'stop');

      infiniteScroll.stop();

      expect(infiniteScroll.listener.stop.callCount).toBe(1);
    });
  });


  describe("Loading", function(){
    it("should call jQuery.ajax", function(){
      var infiniteScroll = new InfiniteScroll(config);

      sinon.spy($, 'ajax');

      infiniteScroll.load();

      expect($.ajax.callCount).toBe(1);

      $.ajax.restore();
    });

    it("should pass `requestConfig` to jQuery.ajax", function(){
      var infiniteScroll = new InfiniteScroll(config);

      sinon.spy($, 'ajax');

      infiniteScroll.load();

      expect($.ajax.calledWith(infiniteScroll.requestConfig)).toBe(true);

      $.ajax.restore();
    });

    it("should skip jQuery.ajax request when `finished` is `true`", function(){
      var infiniteScroll = new InfiniteScroll(config);
      infiniteScroll.finished = true;

      sinon.spy($, 'ajax');

      infiniteScroll.load();

      expect($.ajax.callCount).toBe(0);

      $.ajax.restore();
    });
  });


  describe("Waiting for images", function(){
    it("should delegate to imagesReady if `waitForImages` is `true`", function(done){
      config.waitForImages = true;
      var infiniteScroll = new InfiniteScroll(config);

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
      var infiniteScroll = new InfiniteScroll(config);

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

    it("should set `finished` to `true` if url selector yields 0 elements", function(done){
      var infiniteScroll = new InfiniteScroll(config);

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
    it("should add listener to `loadStart` event", function(){
      var infiniteScroll = new InfiniteScroll(config);
      var listener = function(){};

      infiniteScroll.on('load:start', listener);

      expect(infiniteScroll.listenerCount('load:start')).toBe(1);
    });

    it("should add listener to `loadEnd` event", function(){
      var infiniteScroll = new InfiniteScroll(config);
      var listener = function(){};

      infiniteScroll.on('load:end', listener);

      expect(infiniteScroll.listenerCount('load:end')).toBe(1);
    });

    it("should emit when load cycle has started", function(){
      var infiniteScroll = new InfiniteScroll(config);
      var listenerStub = sinon.stub();

      infiniteScroll.on('load:start', listenerStub);
      infiniteScroll.load();

      expect(listenerStub.calledOnce).toBe(true);
    });

    it("should emit when load cycle has ended", function(done){
      var infiniteScroll = new InfiniteScroll(config);
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
