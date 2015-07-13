"use strict";

/* istanbul ignore next */
var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// -------------------------------------------
// Pipe resources to/from another source
// -------------------------------------------
module.exports = db;

function db(ripple) {
  log("creating");

  if (client) {
    return identity;
  }ripple.db = connection(ripple);
  ripple.db.adaptors = {};
  ripple.db.connections = [];
  ripple.on("change", crud(ripple));
  return ripple;
}

function connection(ripple) {
  return function (config) {
    is.str(config) && (config = {
      type: (config = config.split("://")).shift(),
      user: (config = config.join("://").split(":")).shift(),
      database: (config = config.join(":").split("/")).pop(),
      port: (config = config.join("/").split(":")).pop(),
      host: (config = config.join(":").split("@")).pop(),
      password: config.join("@")
    });

    if (values(config).some(not(Boolean))) return (err("incorrect connection string", config), ripple);

    ripple.db.connections.push((ripple.db.adaptors[config.type] || noop)(config));

    return ripple;
  };
}

function crud(ripple) {
  return function (res) {
    var _ref = arguments[1] === undefined ? {} : arguments[1];

    var key = _ref.key;
    var value = _ref.value;
    var _ref$type = _ref.type;
    var type = _ref$type === undefined ? "load" : _ref$type;

    if (!header("content-type", "application/data")(res)) return;
    if (header("silentdb")(res)) return delete res.headers.silentdb;
    log("crud", res.name, type);

    ripple.db.connections.forEach(function (con) {
      return con[type](silent(ripple))(res, key, value);
    });
  };
}

function silent(ripple) {
  return function (res) {
    return (key("headers.silentdb", true)(res), ripple(res));
  };
}

var header = _interopRequire(require("utilise/header"));

var client = _interopRequire(require("utilise/client"));

var values = _interopRequire(require("utilise/values"));

var noop = _interopRequire(require("utilise/noop"));

var key = _interopRequire(require("utilise/key"));

var not = _interopRequire(require("utilise/not"));

var log = _interopRequire(require("utilise/log"));

var err = _interopRequire(require("utilise/err"));

var is = _interopRequire(require("utilise/is"));

err = err("[ri/db]");
log = log("[ri/db]");