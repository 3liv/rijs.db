'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = db;

var _header = require('utilise/header');

var _header2 = _interopRequireDefault(_header);

var _client = require('utilise/client');

var _client2 = _interopRequireDefault(_client);

var _values = require('utilise/values');

var _values2 = _interopRequireDefault(_values);

var _noop = require('utilise/noop');

var _noop2 = _interopRequireDefault(_noop);

var _key = require('utilise/key');

var _key2 = _interopRequireDefault(_key);

var _not = require('utilise/not');

var _not2 = _interopRequireDefault(_not);

var _is = require('utilise/is');

var _is2 = _interopRequireDefault(_is);

/* istanbul ignore next */
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// -------------------------------------------
// Pipe resources to/from another source
// -------------------------------------------
function db(ripple) {
  /* istanbul ignore next */
var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var db = _ref.db;

  log('creating');
  ripple.adaptors = ripple.adaptors || {};
  ripple.connections = [];
  ripple.on('change.db', crud(ripple));
  connection(ripple)(db);
  return ripple;
}

function connection(ripple) {
  return function (config) {
    if (!config) return ripple;

    // TODO Use built-in url parse
    _is2.default.str(config) && (config = {
      type: (config = config.split('://')).shift(),
      user: (config = config.join('://').split(':')).shift(),
      database: (config = config.join(':').split('/')).pop(),
      port: (config = config.join('/').split(':')).pop(),
      host: (config = config.join(':').split('@')).pop(),
      password: config.join('@')
    });

    if ((0, _values2.default)(config).some((0, _not2.default)(Boolean))) return err('incorrect connection string', config), ripple;

    var connection = (ripple.adaptors[config.type] || _noop2.default)(config);

    connection && ripple.connections.push(connection);

    return ripple;
  };
}

function crud(ripple) {
  return function (res) {
    var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var key = _ref2.key;
    var value = _ref2.value;
    var type = _ref2.type;

    if (!(0, _header2.default)('content-type', 'application/data')(res)) return;
    if ((0, _header2.default)('silentdb')(res)) return delete res.headers.silentdb;
    if (!type) return;
    log('crud', res.name, type);

    ripple.connections.forEach(function (con) {
      return con[type](silent(ripple))(res, key, value);
    });
  };
}

function silent(ripple) {
  return function (res) {
    return (0, _key2.default)('headers.silentdb', true)(res), ripple(res);
  };
}

var err = require('utilise/log')('[ri/db]'),
    log = require('utilise/err')('[ri/db]');