const connect = require('connect')

let user = ['admin', 'zhou']

let api = connect()
.use(users)
.use(pets)
.use(errorhandler)

let app = connect()
.use(hello)
.use('/api', api)
.use(errorpage)
.listen(8080)

function hello (req, resp, next) {
  if (req.url == '\/') {
    resp.end('hello')
  } else {
    next()
  }
}

function users(req, resp, next) {
  let match = req.url.match(/^\/user\/(.+)/)
  if (match) {
    if (user.indexOf(match[1]) !== -1) {
      resp.setHeader('Content-Type', 'application/json')
      resp.end(JSON.stringify(match[1]))
    } else {
      let err = new Error("No such user")
      err.notFound = true
      next(err)
    }
  } else {
    next()
  }
}

function pets(req, resp, next) {
  if (req.url.match(/^\/pet\/(.+)/)) {
    resp.end("Got pet!")
  } else {
    next()
  }
}

function errorhandler(err, req, resp, next) {
  console.log(err.stack)
  resp.setHeader('Content-Type', 'application/json')
  if (err.notFound) {
    resp.statusCode = 404
    resp.end(JSON.stringify(err.message))
  } else {
    resp.statusCode = 500
    resp.end(JSON.stringify({error: 'Internal Server Error!'}))
  }
}

function errorpage(err, req, resp , next) {
  console.log(err.stack)
  resp.statusCode = 500
  resp.end(JSON.stringify({error: 'Internal Server Error!'}))
}