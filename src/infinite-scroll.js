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
