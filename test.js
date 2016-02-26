!(require('utilise/client')) && !function(){

var expect = require('chai').expect
  , promise = require('utilise/promise')
  , client = require('utilise/client')
  , update = require('utilise/update')
  , remove = require('utilise/remove')
  , push = require('utilise/push')
  , time = require('utilise/time')
  , key = require('utilise/key')
  , core = require('rijs.core').default
  , data = require('rijs.data').default
  , db = require('./').default
  , path = require('path')
  , deep = key
  , mockdb
  , result

describe('Database', function(){

  beforeEach(function(){
    mockdb = { table: [{ foo: 'bar', id: 1 }] }
    result = undefined
  })

  it('should initialise adaptors if does not exist', function(){  
    var ripple = data(core())
    expect(ripple.adaptors).to.not.be.ok
    db(ripple)
    expect(ripple.adaptors).to.be.ok
  })

  it('should do nothing if falsy given', function(){  
    var ripple = db(adaptor(data(core())), { })
    expect(ripple.connections.length).to.eql(0)
  })

  it('should do nothing if fail to parse', function(){  
    var ripple = db(adaptor(data(core())), { db: 'wat.com' })
    expect(ripple.connections.length).to.eql(0)
  })

  it('should do nothing if adaptor does not exist', function(){  
    var ripple = db(adaptor(data(core())), { db: 'type://user:password@host:port/database' })
    expect(ripple.connections.length).to.eql(0)
  })

  it('should initialise new connection', function(){  
    var ripple = db(adaptor(data(core())), { db: 'mock://user:password@host:port/database' })
    expect(ripple.adaptors).to.eql({ mock: mock })
    expect(ripple.connections[0].config).to.eql({
      type: 'mock'
    , user: 'user'
    , password: 'password'
    , host: 'host'
    , port: 'port'
    , database: 'database'
    })
  })

  it('should skip non-data resources', function(done){  
    var ripple = db(adaptor(data(core())), { db: 'mock://user:password@host:port/table' })
    expect(ripple('non-data', 'text')).to.eql('text')
    time(20, function(){ 
      expect(ripple('non-data')).to.eql('text') 
    })
    time(40, done)
  })

  it('should load from db', function(done){  
    var ripple = db(adaptor(data(core())), { db: 'mock://user:password@host:port/table' })
    expect(ripple('table')).to.eql([])
    time(20, function(){ 
      expect(ripple('table')).to.eql([{foo: 'bar', id: 1 }]) 
    })
    time(40, done)
  })

  it('should push to db', function(done){  
    var ripple = db(adaptor(data(core())), { db: 'mock://user:password@host:port/table' })
    ripple('table')

    time(20, function(){ 
      var record = { a: 'b' }
      push(record)(ripple('table'))
    })
    time(40, function(){ 
      expect(ripple('table')).to.eql([{foo: 'bar', id: 1 }, { a: 'b', id: 2 }]) 
    })
    time(60, done)
  })

  it('should update to db', function(done){  
    var ripple = db(adaptor(data(core())), {  db: 'mock://user:password@host:port/table' })
    ripple('table')

    time(20, function(){ 
      update('0.foo', 'foo')(ripple('table'))
    })
    time(40, function(){ 
      expect(result).to.eql({ foo: 'foo', id: 1 }) 
    })
    time(60, done)
  })

  it('should remove from db', function(done){  
    var ripple = db(adaptor(data(core())), { db: 'mock://user:password@host:port/table' })
    ripple('table')

    time(20, function(){ 
      remove(0)(ripple('table'))
    })
    time(40, function(){ 
      expect(result).to.eql({ foo: 'bar', id: 1 }) 
      expect(ripple('table')).to.eql([]) 
    })
    time(60, done)
  })

  it('should not reload if not new resource', function(done){  
    var ripple = db(adaptor(data(core())), { db: 'mock://user:password@host:port/table' })
    expect(ripple('table')).to.eql([])
    time(20, function(){ 
      expect(ripple('table')).to.eql([{foo: 'bar', id: 1 }]) 
      ripple('table', [])
    })
    time(40, function(){ 
      expect(ripple('table')).to.eql([])
      ripple('table').emit('change')
    })
    time(60, function(){ 
      expect(ripple('table')).to.eql([])
      done()
    })
  })

  function adaptor(ripple) {
    ripple.adaptors = { mock: mock }
    return ripple
  }

  function mock(config) {
    return {
      add: dbadd
    , update: dbupdate
    , remove: dbremove
    , config: config
    }
  }

  function dbload(ripple){ 
    return function(res){
      time(0, function(){
        ripple({ name: res.name, body: mockdb[res.name], headers: { db: { loaded: true }}})
      })
    }
  }

  function dbadd(ripple){ 
    return function(res, key, value){
      time(0, function(){
        value.id = 2
      })
    }
  }

  function dbupdate(ripple){ 
    return function(res, key, value){
      time(0, function(){
        if (!key && !deep('headers.db.loaded')(res)) return dbload(ripple)(res)
        if (key) result = res.body[key.split('.').shift()]
      })
    }
  }

  function dbremove(ripple){ 
    return function(res, key, value){ 
      time(0, function(){ 
        result = value
      })
    }
  }

})

}()