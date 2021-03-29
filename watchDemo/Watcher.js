const util = require("util")
const events = require("events")
const fs = require("fs")

function Watcher(baseDir, toDir) {
  this.baseDir = baseDir
  this.toDir = toDir
}

module.exports = Watcher

util.inherits(Watcher, events.EventEmitter)

Watcher.prototype.watch = function () {
  let watcher = this
  fs.readdir(this.baseDir, function (error, data) {
    if (error) throw error
    for (let index in data) {
      watcher.emit('process', data[index])
    }
  })
}

Watcher.prototype.start = function () {
  let watcher = this
  fs.watchFile(this.baseDir, function () {
    watcher.watch()
  })
}