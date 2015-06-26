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
