'use strict'

/**
 * 相当于构造函数
 * @param socket
 * @constructor
 */
let Chat = function (socket) {
  this.socket = socket
}

/**
 * 发送消息
 * @param room
 * @param text
 */
Chat.prototype.sendMessage = function (room, text) {
  let message = {
    room: room,
    text: text
  }
  this.socket.emit('message', message)
}

Chat.prototype.changeRoom = function (room) {
  this.socket.emit('join',{
    newRoom: room
  })
}

/**
 * 处理改名和加入指令
 * @param command
 * @returns {boolean}
 */
Chat.prototype.processCommand = function (command) {
  let words = command.split(' ')
  let c = words[0].substring(1, words[0].length).toLowerCase()
  let message = false

  switch (c) {
    case 'join':
      words.shift()
      let room = words.join(' ')
      this.changeRoom(room)
      break

    case 'nick':
      words.shift()
      let name = words.join(' ')
      this.socket.emit('nameAttempt', name)
      break

    default:
      message = 'Unrecognized command.'
      break
  }

  return message
}