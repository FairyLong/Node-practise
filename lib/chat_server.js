const socketio = require("socket.io")

let io
let guestNumber = 1
let nickNames = {}
let nameUsed = []
let currentRoom = {}

exports.listen = function(server) {
  // 启动socket服务器，允许搭载在现有的HTTP服务上
  io = socketio.listen(server)
  io.set('log level', 1)
  // 每个用户的连接逻辑
  io.sockets.on('connection', function (socket){
    // 赋予访客名
    guestNumber = assignGuestName(socket, guestNumber, nickNames, nameUsed)
    // 放入Lobby聊天室
    joinRoom(socket, 'Lobby')
    // 处理用户消息  更名、聊天室变更
    handleMessgeBroadcasting(socket, nickNames)
    // 处理加入聊天室
    handleRoomJoining(socket)
    // 用户发出请求时，向其提供已被占用的聊天室列表
    socket.on('rooms', function (){
      socket.emit('rooms', io.sockets.manager.rooms)
    })
    // 处理用户断开后的事务
    handleClientDisconnection(socket, nickNames, nameUsed)
  })

  /**
   * 分配用户昵称
   * @param socket
   * @param guestNumber
   * @param nickNames
   * @param nameUsed
   * @returns {*}
   */
  function assignGuestName(socket, guestNumber, nickNames, nameUsed) {
    let guestName = 'Guest' + guestNumber
    // 把连接ID和用户名关联
    nickNames[socket.id] = guestName
    // 占用用户名
    nameUsed.push(guestName)
    // 通知
    socket.emit('nameResult', {
      success: true,
      name: name
    })
    // 用户数增1
    return guestNumber + 1
  }

  function joinRoom(socket, room) {
    socket.join(room)

  }
}