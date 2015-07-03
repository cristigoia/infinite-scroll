/* infinite-scroll v0.5.0 - 2015-07-03T03:46:43.924Z - https://github.com/r-park/infinite-scroll */
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
 * @name infiniteScroll
 *
 * @param {{}}      config
 * @param {boolean} [config.autoLoad]
 * @param {string}  config.itemSelector
 * @param {string}  config.nextSelector
 * @param {number}  config.threshold
 * @param {boolean} [config.waitForImages]
 *
 * @returns {{
 *   load: Function,
 *   start: Function,
 *   stop: Function
 * }}
 *
 */
function infiniteScroll(config) {

  /**
   * @type {number}
   */
  var currentPage = 1;


  /**
   * @type {string|undefined}
   */
  var nextUrl = $(config.nextSelector).attr('href');


  /**
   * @type {boolean}
   */
  var finished = !nextUrl;


  /**
   * @type {{load: function(url:string)}}
   */
  var loader = loaderService(
    parserService(config.itemSelector, config.nextSelector),
    config.waitForImages
  );


  /**
   * @type {{
   *   onScroll: Function,
   *   valid: Function,
   *   stopWatching: Function,
   *   watch: Function,
   *   watching: Function
   * }}
   */
  var position = positionService(config.threshold, function(){
    if (config.autoLoad !== false) {
      service.load();
    }
    else {
      service.emit('load:ready');
    }
  });


  /**
   * @param {{items:jQuery, nextUrl:string}} data
   */
  var afterLoad = function(data) {
    if (!data.nextUrl) {
      finished = true;
      service.emit('finished');
    }
    else {
      currentPage++;
      nextUrl = data.nextUrl;
    }

    service.emit('load:end', {items: data.items, page: currentPage}, function(){
      service.start();
    });
  };



  var service = {

    /**
     * @returns {boolean}
     */
    finished : function() {
      return finished;
    },


    /**
     * @returns {string|undefined}
     */
    nextUrl : function() {
      return nextUrl;
    },


    /**
     * @returns {Promise}
     */
    load : function() {
      if (!finished) {
        service.emit('load:start');

        return loader
          .load(nextUrl)
          .then(afterLoad);
      }
      else {
        var deferred = new $.Deferred();
        deferred.resolve();
        return deferred.promise();
      }
    },


    /**
     * Start infinite scroll process.
     */
    start : function() {
      if (!finished) {
        position.watch();
      }
    },


    /**
     * Stop infinite scroll process.
     */
    stop : function() {
      position.stopWatching();
    }

  };


  // Extend `service` with event emitter
  Emitter([
    'load:ready',
    'load:start',
    'load:end',
    'finished'], service);


  return service;

}

/**
 * @name loader
 *
 * @param {function(data:string)} parse
 * @param {boolean} waitForImages
 *
 * @returns {{load: Function}}
 *
 */
function loaderService(parse, waitForImages) {
  return {

    /**
     * @param {string} url
     * @returns {Promise}
     */
    load : function(url) {
      return $.ajax({url: url}).then(function(data){
        var parsedData = parse(data);

        if (waitForImages) {
          return parsedData.items.imagesReady().then(function(){
            return parsedData;
          });
        }
        else {
          return parsedData;
        }
      });
    }

  };
}

/**
 * @name parser
 *
 * @param {string} itemSelector
 * @param {string} nextSelector
 *
 * @returns {function(data:string)}
 *
 */
function parserService(itemSelector, nextSelector) {
  return function(data) {
    data = $('<div>' + data + '</div>');

    return {
      items: data.find(itemSelector),
      nextUrl: data.find(nextSelector).attr('href')
    };
  };
}

/**
 * @name position
 *
 * @param {number} threshold
 * @param {Function} callback
 *
 * @returns {{
 *   onScroll: Function,
 *   valid: Function,
 *   stopWatching: Function,
 *   watch: Function,
 *   watching: Function
 * }}
 *
 */
function positionService(threshold, callback) {

  // @type boolean
  var watching = false;


  var service = {

    /**
     * Listener function to be bound to `scroll` event.
     */
    onScroll : function() {
      if (service.valid()) {
        service.stopWatching();
        callback();
      }
    },


    /**
     * Calculates scroll position, returning `true` if
     * position has crossed `threshold`.
     * @returns {boolean}
     */
    valid : function() {
      return window.innerHeight + window.pageYOffset >= document.body.scrollHeight - threshold;
    },


    /**
     * Stop watching scroll position.
     */
    stopWatching : function() {
      if (watching) {
        watching = false;
        window.removeEventListener('scroll', service.onScroll);
      }
    },


    /**
     * Start watching scroll position.
     */
    watch : function() {
      if (!watching) {
        if (service.valid()) {
          callback();
        }
        else {
          watching = true;
          window.addEventListener('scroll', service.onScroll);
        }
      }
    },


    /**
     * @returns {boolean}
     */
    watching : function() {
      return watching;
    }

  };


  return service;

}

return InfiniteScroll;
}));
