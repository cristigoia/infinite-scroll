'use strict';


/**
 * @name InfiniteScroll
 * @constructor
 *
 * @param {{}} config
 * @param {Element|string} config.container
 * @param {Function}       [config.injector]
 * @param {string}         config.itemSelector
 * @param {string}         config.urlSelector
 * @param {boolean}        config.waitForImages
 *
 */
function InfiniteScroll(config) {
  this.container = $(config.container);
  this.itemSelector = config.itemSelector;
  this.urlSelector = config.urlSelector;

  this.autoLoad = true;
  this.waitForImages = !!config.waitForImages;

  if (config.injector) {
    this.inject = config.injector;
  }

  this.pageLimitReached = false;

  this.requestConfig = {
    context: this,
    dataType: 'html',
    url: $(this.urlSelector).attr('href')
  };

  this.watcher = new Watcher({
    callback: function(){
      if (this.autoload) {
        this.load();
      }
    }.bind(this)
  });
}


InfiniteScroll.prototype = {

  /**
   * @param {String} data
   */
  handleResponse : function(data) {
    var $data = $('<div>' + data + '</div>');

    var $pagination = $data.find(this.urlSelector);
    if ($pagination.length) {
      this.requestConfig.url = $pagination.attr('href');
    }
    else {
      this.pageLimitReached = true;
    }

    var $items = $data.find(this.itemSelector);

    var that = this;

    if (this.waitForImages) {
      $items.imagesReady()
        .then(function(items){
          that.inject(items);
          that.start();
        });
    }
    else {
      this.inject($items);
      this.start();
    }
  },


  /**
   * @param {jQuery} items
   */
  inject : function(items) {
    if (items) {
      this.container.append(items);
    }
  },


  /**
   *
   */
  load : function() {
    if (this.pageLimitReached) return;

    return $.ajax(this.requestConfig)
      .then(this.handleResponse);
  },


  /**
   *
   */
  start : function() {
    this.watcher.start();
  },


  /**
   *
   */
  stop : function() {
    this.watcher.stop();
  }

};
