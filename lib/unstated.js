'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

var React = _interopDefault(require('react'));
var createReactContext = _interopDefault(require('create-react-context'));
var PropTypes = _interopDefault(require('prop-types'));
var defer = _interopDefault(require('tickedoff'));

var _typeof =
  typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
    ? function(obj) {
        return typeof obj;
      }
    : function(obj) {
        return obj &&
          typeof Symbol === 'function' &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? 'symbol'
          : typeof obj;
      };

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }
  return call && (typeof call === 'object' || typeof call === 'function')
    ? call
    : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError(
      'Super expression must either be null or a function, not ' +
        typeof superClass
    );
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var StateContext = createReactContext(null);

var Container = (function() {
  function Container() {
    var _this = this;

    _classCallCheck(this, Container);

    this._listeners = [];

    CONTAINER_DEBUG_CALLBACKS.forEach(function(cb) {
      return cb(_this);
    });
  }

  Container.prototype.setState = function setState(updater, callback) {
    var _this2 = this;

    defer(function() {
      var nextState = void 0;

      if (typeof updater === 'function') {
        nextState = updater(_this2.state);
      } else {
        nextState = updater;
      }

      if (nextState == null) {
        if (callback) callback();
        return;
      }

      _this2.state = Object.assign({}, _this2.state, nextState);

      var completed = 0;
      var total = _this2._listeners.length;

      _this2._listeners.forEach(function(fn) {
        if (!callback) {
          fn();
          return;
        }

        var safeCallback = callback;

        fn(function() {
          completed++;
          if (completed === total) {
            safeCallback();
          }
        });
      });
    });
  };

  Container.prototype.subscribe = function subscribe(fn) {
    this._listeners.push(fn);
  };

  Container.prototype.unsubscribe = function unsubscribe(fn) {
    this._listeners = this._listeners.filter(function(f) {
      return f !== fn;
    });
  };

  return Container;
})();

var DUMMY_STATE = {};

var Subscribe = (function(_React$Component) {
  _inherits(Subscribe, _React$Component);

  function Subscribe() {
    var _temp, _this3, _ret;

    _classCallCheck(this, Subscribe);

    for (
      var _len = arguments.length, args = Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key];
    }

    return (
      (_ret = ((_temp = ((_this3 = _possibleConstructorReturn(
        this,
        _React$Component.call.apply(_React$Component, [this].concat(args))
      )),
      _this3)),
      (_this3.state = {}),
      (_this3.instances = []),
      (_this3.onUpdate = function(cb) {
        _this3.setState(DUMMY_STATE, cb);
      }),
      _temp)),
      _possibleConstructorReturn(_this3, _ret)
    );
  }

  Subscribe.prototype.componentWillUnmount = function componentWillUnmount() {
    this._unsubscribe();
  };

  Subscribe.prototype._unsubscribe = function _unsubscribe() {
    var _this4 = this;

    this.instances.forEach(function(container) {
      container.unsubscribe(_this4.onUpdate);
    });
  };

  Subscribe.prototype._createInstances = function _createInstances(
    map,
    containers
  ) {
    var _this5 = this;

    this._unsubscribe();

    if (map === null) {
      throw new Error(
        'You must wrap your <Subscribe> components with a <Provider>'
      );
    }

    var safeMap = map;
    var instances = containers.map(function(ContainerItem) {
      var instance = void 0;

      if (
        (typeof ContainerItem === 'undefined'
          ? 'undefined'
          : _typeof(ContainerItem)) === 'object' &&
        ContainerItem instanceof Container
      ) {
        instance = ContainerItem;
      } else {
        instance = safeMap.get(ContainerItem);

        if (!instance) {
          instance = new ContainerItem();
          safeMap.set(ContainerItem, instance);
        }
      }

      instance.unsubscribe(_this5.onUpdate);
      instance.subscribe(_this5.onUpdate);

      return instance;
    });

    this.instances = instances;
    return instances;
  };

  Subscribe.prototype.render = function render() {
    var _this6 = this;

    return React.createElement(StateContext.Consumer, null, function(map) {
      return _this6.props.children.apply(
        null,
        _this6._createInstances(map, _this6.props.to)
      );
    });
  };

  return Subscribe;
})(React.Component);

Subscribe.propTypes = {
  to: PropTypes.array.isRequired,
  children: PropTypes.func.isRequired
};

function Provider(props) {
  return React.createElement(StateContext.Consumer, null, function(parentMap) {
    var childMap = new Map(parentMap);

    if (props.inject) {
      props.inject.forEach(function(instance) {
        childMap.set(instance.constructor, instance);
      });
    }

    return React.createElement(
      StateContext.Provider,
      { value: childMap },
      props.children
    );
  });
}

var CONTAINER_DEBUG_CALLBACKS = [];

// If your name isn't Sindre, this is not for you.
// I might ruin your day suddenly if you depend on this without talking to me.
function __SUPER_SECRET_CONTAINER_DEBUG_HOOK__(callback) {
  CONTAINER_DEBUG_CALLBACKS.push(callback);
}

exports.Container = Container;
exports.Subscribe = Subscribe;
exports.Provider = Provider;
exports.__SUPER_SECRET_CONTAINER_DEBUG_HOOK__ = __SUPER_SECRET_CONTAINER_DEBUG_HOOK__;
