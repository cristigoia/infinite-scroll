/**
 * @name Watcher
 * @constructor
 *
 * @param {{}}       options
 * @param {number}   [options.buffer=150]
 * @param {Function} options.callback
 *
 */
function Watcher(options) {
  this.buffer = options.buffer || 150;
  this.callback = options.callback;
  this.watching = false;

  this.listener = function(){
    if (this.validate()) {
      this.stop();
      this.callback();
    }
  }.bind(this);
}


Watcher.prototype = {

  /**
   *
   */
  start : function() {
    if (this.watching) return;

    if (this.validate()) {
      this.callback();
    }
    else {
      this.watching = true;
      window.addEventListener('scroll', this.listener);
    }
  },


  /**
   *
   */
  stop : function() {
    window.removeEventListener('scroll', this.listener);
    this.watching = false;
  },


  /**
   * @returns {boolean}
   */
  validate : function() {
    return window.innerHeight + window.pageYOffset >= document.body.scrollHeight - this.buffer;
  }

};
