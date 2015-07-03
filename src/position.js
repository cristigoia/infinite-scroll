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
