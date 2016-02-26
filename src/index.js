// -------------------------------------------
// Pipe resources to/from another source
// -------------------------------------------
export default function db(ripple, { db } = {}){
  log('creating')
  ripple.adaptors = ripple.adaptors || {}
  ripple.connections = []
  ripple.on('change.db', crud(ripple))
  connection(ripple)(db)
  return ripple
}

const connection = ripple => config => {
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

  const con = (ripple.adaptors[config.type] || noop)(config)

  con && ripple
    .connections
    .push(con)

  return ripple
}

const crud = ripple => (name, change) => {
  const { key, value, type } = change || {}
      , res = ripple.resources[name]
      
  if (!header('content-type', 'application/data')(res)) return
  if (header('silentdb')(res)) return delete res.headers.silentdb
  if (!type) return
  log('crud', name, type)

  ripple
    .connections
    .forEach(con => con[type](silent(ripple))(res, key, value))
}

const silent = ripple => res => (key('headers.silentdb', true)(res), ripple(res))

import header from 'utilise/header'
import client from 'utilise/client'
import values from 'utilise/values'
import noop from 'utilise/noop'
import key from 'utilise/key'
import not from 'utilise/not'
import is from 'utilise/is'
const err = require('utilise/err')('[ri/db]')
    , log = require('utilise/log')('[ri/db]')