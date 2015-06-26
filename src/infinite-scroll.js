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

  eventEmitter(['load:start', 'load:end', 'end'], this);

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

    this.emit('load:start');

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
          this.emit('load:end');
          this.inject($items);
          this.start();
        }.bind(this));
    }
    else {
      this.emit('load:end');
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
      this.emit('end');
    }
  }

};


