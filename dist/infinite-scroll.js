/* infinite-scroll v0.2.0 - 2015-06-26T00:15:41.802Z - https://github.com/r-park/infinite-scroll */
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
 * @name eventEmitter
 *
 * @param {string|string[]} eventTypes
 * @param {Object} [object]
 * @returns {Object}
 */
function eventEmitter(eventTypes, object) { // eslint-disable-line no-unused-vars
  if (object) {
    var keys = Object.keys(emitter),
        n = keys.length,
        key;

    while (n--) {
      key = keys[n];
      object[key] = emitter[key];
    }
  }
  else {
    object = Object.create(emitter); // eslint-disable-line no-param-reassign
  }

  object._events = getEvents(eventTypes);

  return object;
}


/**
 * @param {string|string[]} eventTypes
 * @returns {Object.<string,Array>}
 */
function getEvents(eventTypes) {
  var events = {};

  if (typeof eventTypes === 'string') {
    events[eventTypes] = [];
  }
  else if (Array.isArray(eventTypes) && eventTypes.length) {
    for (var i = 0, l = eventTypes.length; i < l; ++i) {
      events[eventTypes[i]] = [];
    }
  }
  else {
    throw new TypeError('EventEmitter : `eventTypes` is required');
  }

  return events;
}


var emitter = {};


/**
 * @param {string} type
 * @param {Function} listener
 * @param {boolean|Object} [scope]
 * @param {boolean} [once]
 * @returns emitter
 */
emitter.on =
emitter.addListener = function(type, listener, scope, once) {
  if (typeof listener !== 'function') {
    throw new TypeError();
  }

  var listeners = this._getListeners(type);

  if (listeners.length && indexOf(listeners, listener) !== -1) {
    throw new Error();
  }

  if (scope === true || once === true) {
    var that = this,
        fired = false;

    listeners.push({
      fn: function wrapper(data) {
        that.removeListener(type, wrapper);
        if (!fired) {
          fired = true;
          listener.call(scope || {}, data);
        }
      },
      scope: {}
    });
  }
  else {
    listeners.push({
      fn: listener,
      scope: scope || {}
    });
  }

  return this;
};


/**
 * @param {string} type
 * @param {*} data
 * @returns emitter
 */
emitter.emit = function(type, data) {
  var listeners = this._getListeners(type);

  if (listeners.length) {
    listeners = clone(listeners);

    for (var i = 0, l = listeners.length, listener; i < l; ++i) {
      listener = listeners[i];
      listener.fn.call(listener.scope, data);
    }
  }

  return this;
};


/**
 * @param {string} type
 * @param {Function} listener
 * @returns emitter
 */
emitter.removeListener = function(type, listener) {
  var listeners = this._getListeners(type),
      index;

  if (listeners.length) {
    index = indexOf(listeners, listener);
    if (index !== -1) {
      splice(listeners, index);
    }
  }

  return this;
};


/**
 * @param {string} [type]
 * @returns emitter
 */
emitter.removeAllListeners = function(type) {
  if (typeof type === 'string') {
    var listeners = this._getListeners(type);
    listeners.length = 0;
  }
  else if (typeof type === 'undefined') {
    var events = this._events;
    for (var event in events) {
      events[event].length = 0;
    }
  }

  return this;
};


/**
 * @param {string} type
 * @returns {Array}
 */
emitter.listeners = function(type) {
  var listeners = this._getListeners(type);
  return listeners.length ? clone(listeners) : [];
};


/**
 * @param {string} type
 * @returns {number}
 */
emitter.listenerCount = function(type) {
  var listeners = this._getListeners(type);
  return listeners.length;
};


/**
 * @param {string} type
 * @returns {Array}
 * @throws {Error}
 */
emitter._getListeners = function(type) {
  var listeners = this._events[type];
  if (!listeners) {
    throw new Error('EventEmitter : event type `' + type + '` does not exist');
  }
  return listeners;
};


/**
 * @param {Array} listeners
 * @returns {Array}
 */
function clone(listeners) {
  var i = listeners.length,
      cloned = new Array(i);

  while (i--) {
    cloned[i] = listeners[i];
  }

  return cloned;
}


/**
 * @param {Array} listeners
 * @param {Object} listener
 * @returns {number}
 */
function indexOf(listeners, listener) {
  var i = listeners.length;

  while (i--) {
    if (listener === listeners[i].fn) {
      return i;
    }
  }

  return -1;
}


/**
 * @param {Array} listeners
 * @param {number} index
 */
function splice(listeners, index) {
  for (var i = index, j = i + 1, k = listeners.length; j < k; ++i, ++j) {
    listeners[i] = listeners[j];
  }

  listeners.pop();
}

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



return InfiniteScroll;
}));
