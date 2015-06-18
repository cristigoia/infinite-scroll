/* infinite-scroll v0.1.0 - 2015-06-18T04:48:44.347Z - https://github.com/r-park/infinite-scroll */
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
 * @param {{}}                    options
 * @param {boolean}               [options.autoLoad=true]
 * @param {Element|jQuery|string} options.container
 * @param {Function}              [options.inject]
 * @param {string}                options.item
 * @param {string}                options.pagination
 * @param {number}                [options.scrollBuffer=150]
 * @param {boolean}               [options.waitForImages=false]
 *
 */
function InfiniteScroll(options) {

  this.autoLoad = options.autoLoad !== false;

  this.container = $(options.container);

  this.finished = false;

  if (options.inject) {
    this.inject = options.inject;
  }

  this.item = options.item;

  this.pagination = options.pagination;

  this.requestConfig = {
    context: this,
    dataType: 'html',
    url: $(this.pagination).attr('href')
  };

  this.waitForImages = !!options.waitForImages;

  this.watcher = new Watcher({
    buffer: options.scrollBuffer,
    callback: function(){
      if (this.autoLoad) this.load();
    }.bind(this)
  });

}


InfiniteScroll.prototype = {

  inject : function(items) {
    if (items) {
      this.container.append(items);
    }
  },


  load : function() {
    if (this.finished) return;

    return $.ajax(this.requestConfig)
      .then(this.process);
  },


  process : function(data) {
    var $data = $('<div>' + data + '</div>');
    var $items = $data.find(this.item);

    this.updatePagination($data);

    if (this.waitForImages) {
      $items.imagesReady()
        .then(function(){
          this.inject($items);
          this.start();
        }.bind(this));
    }
    else {
      this.inject($items);
      this.start();
    }
  },


  start : function() {
    if (this.finished) return;
    this.watcher.start();
  },


  stop : function() {
    this.watcher.stop();
  },


  updatePagination : function(data) {
    var $pagination = data.find(this.pagination);
    if ($pagination.length) {
      this.requestConfig.url = $pagination.attr('href');
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
