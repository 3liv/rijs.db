// -------------------------------------------
// Pipe resources to/from another source
// -------------------------------------------
export default function db(ripple){
  log('creating')
  
  if (client) return identity
  ripple.db = connection(ripple)
  ripple.db.adaptors = {}
  ripple.db.connections = []
  ripple.on('change', crud(ripple))
  return ripple
}

function connection(ripple) {
  return function(config){
    if (!config) return ripple

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

    ripple
      .db
      .connections
      .push((ripple.db.adaptors[config.type] || noop)(config))

    return ripple
  }
}

function crud(ripple) {
  return function(res, {key, value, type = 'load'} = {}){
    if (!header('content-type', 'application/data')(res)) return
    if (header('silentdb')(res)) return delete res.headers.silentdb
    log('crud', res.name, type)

    ripple
      .db
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