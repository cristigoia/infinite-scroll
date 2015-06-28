/* infinite-scroll v0.4.1 - 2015-06-28T01:41:34.521Z - https://github.com/r-park/infinite-scroll */
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.InfiniteScroll = factory();
  }
}(this, function() {
'use strict';


/**
 * @name InfiniteScroll
 * @constructor
 *
 * @param {{}}      options
 * @param {boolean} [options.autoLoad=true]
 * @param {string}  options.item
 * @param {string}  options.next
 * @param {number}  [options.activeZone=200]
 * @param {boolean} [options.waitForImages=false]
 *
 */
function InfiniteScroll(options) {
  eventEmitter(['load:ready', 'load:start', 'load:end'], this);

  this.autoLoad = options.autoLoad !== false;

  this.currentPage = 0;

  this.finished = false;

  this.itemSelector = options.item;
  this.nextSelector = options.next;

  this.requestConfig = {
    context: this,
    dataType: 'html'
  };

  this.updatePagination($(this.nextSelector));

  this.waitForImages = !!options.waitForImages;

  this.listener = new Listener({
    activeZone: options.activeZone || 200,
    callback: function(){
      if (this.autoLoad) {
        this.load();
      }
      else {
        this.emit('load:ready');
      }
    }.bind(this)
  });
}


InfiniteScroll.prototype = {

  /**
   * Load the next available page.
   */
  load : function() {
    if (this.finished) return;

    this.emit('load:start');

    return $.ajax(this.requestConfig)
      .then(function(data){
        var $data = $('<div>' + data + '</div>'),
            $items = $data.find(this.itemSelector),
            $pagination = $data.find(this.nextSelector);

        $data = null;

        this.updatePagination($pagination);

        if (this.waitForImages) {
          $items.imagesReady()
            .then(this.postLoad.bind(this));
        }
        else {
          this.postLoad($items);
        }
      });
  },


  /**
   * @param {jQuery} items
   */
  postLoad : function(items) {
    var data = {items: items, page: this.currentPage},
        that = this;

    this.emit('load:end', data, function(){
      that.start();
    });
  },


  /**
   * Start infinite-scroll.
   */
  start : function() {
    if (!this.finished) {
      this.listener.start();
    }
  },


  /**
   * Stop infinite-scroll.
   */
  stop : function() {
    this.listener.stop();
  },


  /**
   * @param {jQuery} pagination
   */
  updatePagination : function(pagination) {
    this.currentPage++;

    if (pagination.length) {
      this.requestConfig.url = pagination.attr('href');
    }
    else {
      this.finished = true;
    }
  }

};

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

return InfiniteScroll;
}));
