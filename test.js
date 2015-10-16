!(require('utilise/client')) && !function(){

var expect = require('chai').expect
  , promise = require('utilise/promise')
  , client = require('utilise/client')
  , reactive = require('rijs.reactive')
  , core = require('rijs.core')
  , data = require('rijs.data')
  , path = require('path')
  , db = require('./')
  , mockdb
  , result

describe('Database', function(){

  beforeEach(function(){
    mockdb = { table: [{ foo: 'bar', id: 1 }] }
    result = undefined
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
    setTimeout(function(){ 
      expect(ripple('non-data')).to.eql('text') 
    }, 20)
    setTimeout(done, 40)
  })

  it('should load from db', function(done){  
    var ripple = db(adaptor(data(core())), { db: 'mock://user:password@host:port/table' })
    expect(ripple('table')).to.eql([])
    setTimeout(function(){ 
      expect(ripple('table')).to.eql([{foo: 'bar', id: 1 }]) 
    }, 20)
    setTimeout(done, 40)
  })

  it('should push to db', function(done){  
    var ripple = db(adaptor(reactive(data(core()))), { db: 'mock://user:password@host:port/table' })
    ripple('table')

    setTimeout(function(){ 
      ripple('table').push({ a: 'b' })
    }, 20)
    setTimeout(function(){ 
      expect(ripple('table')).to.eql([{foo: 'bar', id: 1 }, { a: 'b', id: 2 }]) 
    }, 40)
    setTimeout(done, 60)
  })

  it('should update to db', function(done){  
    var ripple = db(adaptor(reactive(data(core()))), {  db: 'mock://user:password@host:port/table' })
    ripple('table')

    setTimeout(function(){ 
      ripple('table')[0].foo = 'foo'
    }, 20)
    setTimeout(function(){ 
      expect(result).to.eql({foo: 'foo', id: 1}) 
    }, 40)
    setTimeout(done, 60)
  })

  it('should remove from db', function(done){  
    var ripple = db(adaptor(reactive(data(core()))), { db: 'mock://user:password@host:port/table' })
    ripple('table')

    setTimeout(function(){ 
      delete ripple('table')[0]
    }, 20)
    setTimeout(function(){ 
      expect(result).to.eql({foo: 'bar', id: 1}) 
      expect(ripple('table')).to.eql([]) 
    }, 40)
    setTimeout(done, 60)
  })

  it('should not trigger if not new resource', function(done){  
    var ripple = db(adaptor(reactive(data(core()))), { db: 'mock://user:password@host:port/table' })
    expect(ripple('table')).to.eql([])
    setTimeout(function(){ 
      expect(ripple('table')).to.eql([{foo: 'bar', id: 1 }]) 
      ripple('table', [])
    }, 20)
    setTimeout(function(){ 
      expect(ripple('table')).to.eql([])
      ripple('table').emit('change')
    }, 40)
    setTimeout(function(){ 
      expect(ripple('table')).to.eql([])
      done()
    }, 60)
  })

  function adaptor(ripple) {
    ripple.adaptors = { mock: mock }
    return ripple
  }

  function mock(config) {
    return {
      push: push
    , update: update
    , remove: remove
    , load: load
    , config: config
    }
  }

  function load(ripple){ 
    return function(res){
      setTimeout(function(){
        ripple({ name: res.name, body: mockdb[res.name]})
      }, 0)
    }
  }

  function push(ripple){ 
    return function(res, key, value){
      setTimeout(function(){
        value.id = 2
      }, 0)
    }
  }

  function update(ripple){ 
    return function(res, key, value){
      setTimeout(function(){
        result = value
      }, 0)
    }
  }

  function remove(ripple){ 
    return function(res, key, value){ 
      setTimeout(function(){ 
        result = value
      }, 0)
    }
  }

})

}()