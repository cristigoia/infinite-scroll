describe("Position service", function(){

  var callback,
      pos;


  fixture.setBase('test/fixtures');


  beforeEach(function(){
    callback = sinon.stub();
    pos = positionService(100, callback);
  });


  afterEach(function(){
    fixture.cleanup();
  });


  describe("Initializing", function(){
    it("should set `watching` to `false`", function(){
      expect(pos.watching()).toBe(false);
    });

    it("should return service interface", function(){
      expect(Object.keys(pos)).toEqual([
        'onScroll',
        'valid',
        'stopWatching',
        'watch',
        'watching'
      ]);
    });
  });


  describe("Starting watch", function(){
    describe("when `watching` is `true`", function(){
      it("should do nothing", function(){
        fixture.load('long.html'); // inject long content to force watching

        sinon.spy(pos, 'valid');

        expect(pos.valid.callCount).toBe(0);

        pos.watch();

        expect(pos.valid.callCount).toBe(1);

        pos.watch();

        expect(pos.valid.callCount).toBe(1);
      });
    });


    describe("when `watching` is `false`", function(){
      it("should validate current scroll position", function(){
        sinon.spy(pos, 'valid');
        pos.watch();
        expect(pos.valid.callCount).toBe(1);
      });
    });


    describe("when current scroll position is valid", function(){
      it("should not set `watching` to true", function(){
        sinon.stub(pos, 'valid').returns(true);
        pos.watch();
        expect(pos.watching()).toBe(false);
      });

      it("should not bind to scroll event", function(){
        sinon.stub(pos, 'valid').returns(true);
        sinon.spy(window, 'addEventListener');
        pos.watch();
        expect(window.addEventListener.callCount).toBe(0);

        window.addEventListener.restore();
      });

      it("should immediately invoke `callback` function", function(){
        sinon.stub(pos, 'valid').returns(true);
        pos.watch();
        expect(callback.callCount).toBe(1);
      });
    });


    describe("when current scroll position is invalid", function(){
      it("should set `watching` to true", function(){
        sinon.stub(pos, 'valid').returns(false);
        pos.watch();
        expect(pos.watching()).toBe(true);
      });

      it("should bind to scroll event", function(){
        sinon.stub(pos, 'valid').returns(false);
        sinon.spy(window, 'addEventListener');

        pos.watch();

        expect(window.addEventListener.callCount).toBe(1);
        expect(window.addEventListener.calledWith('scroll', pos.onScroll)).toBe(true);

        window.addEventListener.restore();
      });
    });
  });


  describe("Stopping watch", function(){
    describe("when `watching` is `true`", function(){
      it("should unbind from scroll event", function(){
        fixture.load('long.html'); // inject long content to force watching

        sinon.spy(window, 'removeEventListener');

        pos.watch();
        pos.stopWatching();

        expect(window.removeEventListener.callCount).toBe(1);
        expect(window.removeEventListener.calledWith('scroll', pos.onScroll)).toBe(true);

        window.removeEventListener.restore();
      });

      it("should set `watching` to `false`", function(){
        fixture.load('long.html'); // inject long content to force watching

        pos.watch();

        expect(pos.watching()).toBe(true);

        pos.stopWatching();

        expect(pos.watching()).toBe(false);
      });
    });


    describe("when `watching` is `false`", function(){
      it("should not unbind from scroll event", function(){
        sinon.spy(window, 'removeEventListener');

        pos.watch();

        expect(pos.watching()).toBe(false);

        pos.stopWatching();

        expect(window.removeEventListener.callCount).toBe(0);

        window.removeEventListener.restore();
      });

      it("should bind to scroll event", function(){});
    });
  });


  describe("Triggering scroll event listener", function(){
    it("should call validation function", function(done){
      sinon.stub(pos, 'valid', function(){
        expect(pos.valid.callCount).toBe(1);
        done();
      });

      pos.onScroll();
    });


    describe("when position is valid", function(){
      it("should unbind from scroll event", function(){
        fixture.load('long.html'); // inject long content to force watching

        sinon.spy(window, 'removeEventListener');

        pos.watch();

        sinon.stub(pos, 'valid').returns(true); // stub `true` when called by `onScroll`

        pos.onScroll();

        expect(window.removeEventListener.callCount).toBe(1);
        expect(window.removeEventListener.calledWith('scroll', pos.onScroll)).toBe(true);

        window.removeEventListener.restore();
      });

      it("should set `watching` to `false`", function(){
        fixture.load('long.html'); // inject long content to force watching

        pos.watch();

        expect(pos.watching()).toBe(true);

        sinon.stub(pos, 'valid').returns(true); // stub `true` when called by `onScroll`

        pos.onScroll();

        expect(pos.watching()).toBe(false);
      });

      it("should invoke `callback` function", function(){
        fixture.load('long.html'); // inject long content to force watching

        pos.watch();

        sinon.stub(pos, 'valid').returns(true); // stub `true` when called by `onScroll`

        pos.onScroll();

        expect(callback.callCount).toBe(1);
      });
    });


    describe("when position is invalid", function(){
      it("should not unbind from scroll event", function(){
        fixture.load('long.html'); // inject long content to force watching

        sinon.spy(window, 'removeEventListener');

        pos.watch();
        pos.onScroll();

        expect(window.removeEventListener.callCount).toBe(0);

        window.removeEventListener.restore();
      });

      it("should not set `watching` to `false`", function(){
        fixture.load('long.html'); // inject long content to force watching

        pos.watch();

        expect(pos.watching()).toBe(true);

        pos.onScroll();

        expect(pos.watching()).toBe(true);
      });

      it("should not invoke `callback` function", function(){
        fixture.load('long.html'); // inject long content to force watching

        pos.watch();
        pos.onScroll();

        expect(callback.callCount).toBe(0);
      });
    });
  });

});
