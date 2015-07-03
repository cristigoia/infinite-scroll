describe("Loader service", function(){

  var loader,
      parser,
      parsedData,
      url;


  beforeEach(function(){
    parsedData = {items: $('<div><img src="/base/test/fixtures/1.jpg"></div>')};
    parser = sinon.stub().returns(parsedData);
    url = '/base/test/fixtures/page-2.html';
  });


  describe("Initializing", function(){
    it("should return loader service", function(){
      loader = loaderService(parser, false);
      expect(loader).toBeDefined();
      expect(typeof loader.load).toBe('function');
    });
  });


  describe("Loading", function(){
    it("should call jQuery.ajax", function(done){
      loader = loaderService(parser, false);

      sinon.spy($, 'ajax');

      loader.load(url).then(function(){
        expect($.ajax.callCount).toBe(1);
        $.ajax.restore();
        done();
      });
    });

    it("should parse response data with provided parser service", function(done){
      loader = loaderService(parser, false);

      loader.load(url).then(function(){
        expect(parser.callCount).toBe(1);
        done();
      });
    });

    it("should return parsed response data", function(done){
      loader = loaderService(parser, false);

      loader.load(url).then(function(data){
        expect(data).toBe(parsedData);
        done();
      });
    });


    describe("when `waitForImages` is `true`", function(){
      it("should delegate to `imagesReady`", function(done){
        sinon.spy($.fn, 'imagesReady');

        loader = loaderService(parser, true);

        loader.load(url).then(
          function(data){
            expect($.fn.imagesReady.callCount).toBe(1);
            expect(data).toBe(parsedData);
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

});
