const http = require("http")
const fs = require("fs")
const mime = require("mime")
const path = require("path")
const chatServer = require("./lib/chat_server")

let cache = {}

let server = http.createServer(function (request, response) {
  let filePath = null
  if (request.url == '/') {
    filePath = "public/index.html"
  } else {
    filePath = "public" + request.url
  }

  let absPath = "./" + filePath
  serverStatic(response, absPath)
})

server.listen(8080, function (error){
  console.log("server is running!")
});

chatServer.listen(server)

function send404(response) {
  response.writeHead(404, {"Content-Type":"text/plain"})
  response.write('Error 404: Resource Not Found')
  response.end()
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(200, {"Content-Type": mime.getType(path.basename(filePath))})
  response.end(fileContents)
}

function serverStatic(response, absFilePath) {
  if (cache[absFilePath]) {
    sendFile(response, absFilePath, cache[absFilePath])
  } else {
    fs.readFile(absFilePath, function (err, data) {
      if (err) {
        send404(response)
      } else {
        cache[absFilePath] = data
        sendFile(response, absFilePath, data)
      }
    })
  }
}