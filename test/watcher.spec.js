describe("Watcher", function(){

  var options,
      watcher;


  beforeEach(function(){
    options = {
      callback: function(){}
    };

    watcher = new Watcher(options);
  });


  describe("Constructor", function(){
    it("should set property `buffer` to options.buffer", function(){
      var watcher = new Watcher({buffer: 200});
      expect(watcher.buffer).toBe(200);
    });

    it("should set property `buffer` to default value", function(){
      expect(watcher.buffer).toBe(150);
    });

    it("should set property `callback` to options.callback", function(){
      expect(watcher.callback).toBe(options.callback);
    });

    it("should set property `watching` to false", function(){
      expect(watcher.watching).toBe(false);
    });

    it("should set `listener` function", function(){
      expect(typeof watcher.listener).toBe('function');
    });
  });


  describe("Starting watch", function(){
    it("should pre-validate", function(){
      sinon.spy(watcher, 'validate');

      watcher.start();

      expect(watcher.validate.callCount).toBe(1);
    });

    it("should immediately call `callback` if pre-validation returns valid result", function(){
      sinon.spy(watcher, 'callback');
      sinon.stub(watcher, 'validate').returns(true);

      watcher.start();

      expect(watcher.callback.callCount).toBe(1);
    });

    it("should set `watching` to `true` if pre-validation fails", function(){
      sinon.stub(watcher, 'validate').returns(false);

      watcher.start();

      expect(watcher.watching).toBe(true);
    });

    it("should bind `listener` to `scroll` event if pre-validation fails", function(){
      sinon.spy(window, 'addEventListener');
      sinon.stub(watcher, 'validate').returns(false);

      watcher.start();

      expect(window.addEventListener.callCount).toBe(1);
      expect(window.addEventListener.calledWith('scroll', watcher.listener)).toBe(true);

      window.addEventListener.restore();
    });

    it("should do nothing if `watching` is `true`", function(){
      sinon.spy(watcher, 'validate');

      watcher.watching = true;
      watcher.start();

      expect(watcher.validate.callCount).toBe(0);
    });
  });


  describe("Stopping watch", function(){
    it("should unbind `listener` from `scroll` event", function(){
      sinon.spy(window, 'removeEventListener');

      watcher.stop();

      expect(window.removeEventListener.callCount).toBe(1);
      expect(window.removeEventListener.calledWith('scroll', watcher.listener)).toBe(true);

      window.removeEventListener.restore();
    });

    it("should set `watching` to `false`", function(){
      watcher.watching = true;
      watcher.stop();

      expect(watcher.watching).toBe(false);
    });
  });


  describe("Scroll event listener", function(){
    it("should call validation function", function(){
      sinon.spy(watcher, 'validate');

      watcher.listener();

      expect(watcher.validate.callCount).toBe(1);
    });


    describe("with valid result", function(){
      it("should unbind `listener` from `scroll` event", function(){
        sinon.spy(window, 'removeEventListener');
        sinon.stub(watcher, 'validate').returns(true);

        watcher.listener();

        expect(window.removeEventListener.callCount).toBe(1);
        expect(window.removeEventListener.calledWith('scroll', watcher.listener)).toBe(true);

        window.removeEventListener.restore();
      });

      it("should set `watching` to `false`", function(){
        sinon.stub(watcher, 'validate').returns(true);

        watcher.watching = true;
        watcher.listener();

        expect(watcher.watching).toBe(false);
      });

      it("should call `callback` function", function(){
        sinon.spy(watcher, 'callback');
        sinon.stub(watcher, 'validate').returns(true);

        watcher.listener();

        expect(watcher.callback.callCount).toBe(1);
      });
    });


    describe("with invalid result", function(){
      it("should NOT unbind `listener` from `scroll` event", function(){
        sinon.spy(window, 'removeEventListener');
        sinon.stub(watcher, 'validate').returns(false);

        watcher.listener();

        expect(window.removeEventListener.callCount).toBe(0);

        window.removeEventListener.restore();
      });

      it("should NOT set `watching` to `false`", function(){
        sinon.stub(watcher, 'validate').returns(false);

        watcher.watching = true;
        watcher.listener();

        expect(watcher.watching).toBe(true);
      });

      it("should NOT call `callback` function", function(){
        sinon.spy(watcher, 'callback');
        sinon.stub(watcher, 'validate').returns(false);

        watcher.listener();

        expect(watcher.callback.callCount).toBe(0);
      });
    });
  });

});
