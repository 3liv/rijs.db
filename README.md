# Ripple | Database
[![Coverage Status](https://coveralls.io/repos/rijs/db/badge.svg?branch=master&service=github)](https://coveralls.io/github/rijs/db?branch=master)
[![Build Status](https://travis-ci.org/rijs/db.svg)](https://travis-ci.org/rijs/db)

Allows connecting a Ripple node to other external services

```js
ripple.db('type://user:password@host:port/database')
```

It destructures the connection string into an object, looks up the `type` in `ripple.adaptors`, then passes that function the connection string as an object, and stores the result under `ripple.connections`. 

You must register any adaptors you wish to use separate to this module. An adaptor is a function that takes the connection string as an object, creates an active connection and returns and object of four crud functions: `{ push, update, remove, load }`. These hooks will be invoked when the corresponding event occurs. 