/**
 * @name Listener
 * @constructor
 *
 * @param {{}}       options
 * @param {number}   [options.activeZone=200]
 * @param {function} options.callback
 *
 * TODO: extend Listener with eventEmitter
 *
 */
function Listener(options) {

  var timeoutId = null;


  this.activeZone = options.activeZone || 200;
  this.callback = options.callback;
  this.listening = false;


  /**
   * Scroll event handler/throttler.
   * @type {function(this:Listener)}
   */
  this.onScroll = function() {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(this.resolve, 100);
  }.bind(this);


  /**
   * @type {function(this:Listener)}
   */
  this.resolve = function() {
    if (this.validate()) {
      this.stop();
      this.callback();
    }
  }.bind(this);

}


Listener.prototype = {

  /**
   * Start listening to scroll event.
   */
  start : function() {
    if (this.listening) return;

    if (this.validate()) {
      this.callback();
    }
    else {
      this.listening = true;
      window.addEventListener('scroll', this.onScroll);
    }
  },


  /**
   * Stop listening to scroll event.
   */
  stop : function() {
    if (!this.listening) return;
    window.removeEventListener('scroll', this.onScroll);
    this.listening = false;
  },


  /**
   * @returns {boolean}
   */
  validate : function() {
    return window.innerHeight + window.pageYOffset >= document.body.scrollHeight - this.activeZone;
  }

};
