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
    it("should set property `container` using css selector", function(){
      var infiniteScroll = new InfiniteScroll(config);
      var container = document.querySelector('.posts');

      expect(infiniteScroll.container.jquery).toBeDefined();
      expect(infiniteScroll.container.length).toBe(1);
      expect(infiniteScroll.container[0]).toBe(container);
    });

    it("should set `item` to be `options.item`", function(){
      var infiniteScroll = new InfiniteScroll(config);
      expect(infiniteScroll.item).toBe(config.item);
    });

    it("should set `pagination` to be `options.pagination`", function(){
      var infiniteScroll = new InfiniteScroll(config);
      expect(infiniteScroll.pagination).toBe(config.pagination);
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

    it("should set `inject` to be function `options.inject`", function(){
      config.inject = function(){};
      var infiniteScroll = new InfiniteScroll(config);

      expect(infiniteScroll.inject).toBe(config.inject);
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

    it("should set `watcher` with instance of Watcher", function(){
      var infiniteScroll = new InfiniteScroll(config);
      expect(infiniteScroll.watcher instanceof Watcher).toBe(true);
    });
  });


  describe("Starting", function(){
    it("should start the watcher", function(){
      var infiniteScroll = new InfiniteScroll(config);

      sinon.stub(infiniteScroll.watcher, 'start');

      infiniteScroll.start();

      expect(infiniteScroll.watcher.start.callCount).toBe(1);
    });
  });


  describe("Stopping", function(){
    it("should stop the watcher", function(){
      var infiniteScroll = new InfiniteScroll(config);

      sinon.stub(infiniteScroll.watcher, 'stop');

      infiniteScroll.stop();

      expect(infiniteScroll.watcher.stop.callCount).toBe(1);
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


  describe("Injecting", function(){
    it("should inject jQuery-wrapped items extracted from ajax response", function(done){
      var infiniteScroll = new InfiniteScroll(config);

      sinon.spy(infiniteScroll, 'inject');

      infiniteScroll.load().then(
        function(){
          expect(infiniteScroll.inject.callCount).toBe(1);
          expect($('article').length).toBe(8);
          expect($('.post-page-2').length).toBe(4);
          done();
        },
        function(){
          expect(false).toBe(true);
          done();
        }
      );
    });
  });

});
