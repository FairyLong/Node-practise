const Watcher = require('./Watcher')
const fs = require('fs')

const basePath = 'C:\\Users\\yilong.zhou\\Desktop\\test1'
const toPath = 'C:\\Users\\yilong.zhou\\Desktop\\test2'
let watcher = new Watcher(basePath, toPath)

watcher.on('process', function (file) {
  let originFile = basePath + '\\' + file
  let newFile = toPath + '\\' + file.toLowerCase()

  fs.rename(originFile, newFile, function (err) {
    if (err) throw err
  })
})

/**
 * node异步 重复事件demo，监听一个文件夹，将文件改到另一个
 */
watcher.start()