// -------------------------------------------
// Pipe resources to/from another source
// -------------------------------------------
export default function db(ripple, { db } = {}){
  if (client) return identity
  
  log('creating')
  ripple.adaptors = ripple.adaptors || {}
  ripple.connections = []
  ripple.on('change.db', crud(ripple))
  connection(ripple)(db)
  return ripple
}

function connection(ripple) {
  return function(config){
    if (!config) return ripple

    // TODO Use built-in url parse
    is.str(config) && (config = {
      type    : (config = config.split('://')).shift()
    , user    : (config = config.join('://').split(':')).shift()
    , database: (config = config.join(':').split('/')).pop()
    , port    : (config = config.join('/').split(':')).pop()
    , host    : (config = config.join(':').split('@')).pop()
    , password: config.join('@')
    })

    if (values(config).some(not(Boolean))) 
      return err('incorrect connection string', config), ripple

    var connection = (ripple.adaptors[config.type] || noop)(config)

    connection && ripple
      .connections
      .push(connection)

    return ripple
  }
}

function crud(ripple) { 
  return function(res, {key, value, type} = {}){
    if (!header('content-type', 'application/data')(res)) return
    if (header('silentdb')(res)) return delete res.headers.silentdb
    if (!type) return
    log('crud', res.name, type)

    ripple
      .connections
      .forEach(con => con[type](silent(ripple))(res, key, value))
  }
}

function silent(ripple) {
  return res => (key('headers.silentdb', true)(res), ripple(res))
}

import header from 'utilise/header'
import client from 'utilise/client'
import values from 'utilise/values'
import noop from 'utilise/noop'
import key from 'utilise/key'
import not from 'utilise/not'
import log from 'utilise/log'
import err from 'utilise/err'
import is from 'utilise/is'
err = err('[ri/db]')
log = log('[ri/db]')