/* infinite-scroll v0.3.0 - 2015-06-26T06:35:50.973Z - https://github.com/r-park/infinite-scroll */
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
 * @param {string}  options.pagination
 * @param {number}  [options.scrollBuffer=150]
 * @param {boolean} [options.waitForImages=false]
 *
 */
function InfiniteScroll(options) {

  eventEmitter(['load:start', 'load:end'], this);

  this.autoLoad = options.autoLoad !== false;

  this.currentPage = 1;

  this.finished = false;

  this.itemSelector = options.item;

  this.paginationSelector = options.pagination;

  this.requestConfig = {
    context: this,
    dataType: 'html',
    url: $(this.paginationSelector).attr('href')
  };

  this.waitForImages = !!options.waitForImages;

  // TODO: need to emit when autoLoad is false
  this.watcher = new Watcher({
    buffer: options.scrollBuffer,
    callback: function(){
      if (this.autoLoad) this.load();
    }.bind(this)
  });

}


InfiniteScroll.prototype = {

  /**
   * @returns {Promise}
   */
  load : function() {
    if (this.finished) return;

    this.emit('load:start');

    return $.ajax(this.requestConfig)
      .then(function(data){
        var $data = $('<div>' + data + '</div>'),
            $items = $data.find(this.itemSelector),
            $pagination = $data.find(this.paginationSelector);

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
   *
   */
  start : function() {
    if (!this.finished) {
      this.watcher.start();
    }
  },


  /**
   *
   */
  stop : function() {
    this.watcher.stop();
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

return InfiniteScroll;
}));
