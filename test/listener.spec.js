describe("Listener", function(){

  var options,
      listener;


  beforeEach(function(){
    options = {
      callback: sinon.stub()
    };

    listener = new Listener(options);
  });


  describe("Constructor", function(){
    it("should set property `activeZone` to options.activeZone", function(){
      var listener = new Listener({activeZone: 300});
      expect(listener.activeZone).toBe(300);
    });

    it("should set property `activeZone` to default value", function(){
      expect(listener.activeZone).toBe(200);
    });

    it("should set property `callback` to options.callback", function(){
      expect(listener.callback).toBe(options.callback);
    });

    it("should set property `listening` to false", function(){
      expect(listener.listening).toBe(false);
    });

    it("should set `onScroll` function", function(){
      expect(typeof listener.onScroll).toBe('function');
    });

    it("should set `resolve` function", function(){
      expect(typeof listener.resolve).toBe('function');
    });
  });


  describe("Starting watch", function(){
    it("should pre-validate", function(){
      sinon.stub(listener, 'validate');

      listener.start();

      expect(listener.validate.callCount).toBe(1);
    });

    it("should immediately call `callback` if pre-validation returns valid result", function(){
      sinon.stub(listener, 'validate').returns(true);

      listener.start();

      expect(options.callback.callCount).toBe(1);
    });

    it("should set `listening` to `true` if pre-validation fails", function(){
      sinon.stub(listener, 'validate').returns(false);

      listener.start();

      expect(listener.listening).toBe(true);
    });

    it("should bind listener to scroll event if pre-validation fails", function(){
      sinon.spy(window, 'addEventListener');
      sinon.stub(listener, 'validate').returns(false);

      listener.start();

      expect(window.addEventListener.callCount).toBe(1);
      expect(window.addEventListener.calledWith('scroll', listener.onScroll)).toBe(true);

      window.addEventListener.restore();
    });

    it("should do nothing if `listening` is `true`", function(){
      sinon.spy(listener, 'validate');
      sinon.spy(window, 'addEventListener');

      listener.listening = true;
      listener.start();

      expect(window.addEventListener.callCount).toBe(0);
      expect(listener.validate.callCount).toBe(0);

      window.addEventListener.restore();
    });
  });


  describe("Stopping listener", function(){
    it("should unbind listener from scroll event when `listening` is `true`", function(){
      sinon.spy(window, 'removeEventListener');

      listener.listening = true;
      listener.stop();

      expect(window.removeEventListener.callCount).toBe(1);
      expect(window.removeEventListener.calledWith('scroll', listener.onScroll)).toBe(true);

      window.removeEventListener.restore();
    });

    it("should skip unbinding listener from scroll event when `listening` is `false`", function(){
      sinon.spy(window, 'removeEventListener');

      listener.listening = false;
      listener.stop();

      expect(window.removeEventListener.callCount).toBe(0);

      window.removeEventListener.restore();
    });

    it("should set `listening` to `false`", function(){
      listener.listening = true;
      listener.stop();

      expect(listener.listening).toBe(false);
    });
  });


  describe("Scroll event listener", function(){
    it("should debounce and call resolution function", function(done){
      sinon.stub(listener, 'resolve', function(){
        expect(true).toBe(true);
        done();
      });

      listener.onScroll();
    });

    it("should call validation function", function(done){
      sinon.stub(listener, 'validate', function(){
        expect(listener.validate.callCount).toBe(1);
        done();
      });

      listener.onScroll();
    });


    describe("with valid result", function(){
      it("should unbind listener from scroll event when `listening` is `true`", function(){
        sinon.spy(window, 'removeEventListener');
        sinon.stub(listener, 'validate').returns(true);

        listener.listening = true; // setting to `true` for test
        listener.resolve();

        expect(window.removeEventListener.callCount).toBe(1);
        expect(window.removeEventListener.calledWith('scroll', listener.onScroll)).toBe(true);

        window.removeEventListener.restore();
      });

      it("should set `listening` to `false`", function(){
        sinon.stub(listener, 'validate').returns(true);

        listener.listening = true;
        listener.resolve();

        expect(listener.listening).toBe(false);
      });

      it("should call `callback` function", function(){
        sinon.stub(listener, 'validate').returns(true);

        listener.resolve();

        expect(options.callback.callCount).toBe(1);
      });
    });


    describe("with invalid result", function(){
      it("should NOT unbind `listener` from `scroll` event", function(){
        sinon.spy(window, 'removeEventListener');
        sinon.stub(listener, 'validate').returns(false);

        listener.resolve();

        expect(window.removeEventListener.callCount).toBe(0);

        window.removeEventListener.restore();
      });

      it("should NOT set `listening` to `false`", function(){
        sinon.stub(listener, 'validate').returns(false);

        listener.listening = true;
        listener.resolve();

        expect(listener.listening).toBe(true);
      });

      it("should NOT call `callback` function", function(){
        sinon.stub(listener, 'validate').returns(false);

        listener.resolve();

        expect(options.callback.callCount).toBe(0);
      });
    });
  });

});
