const socketio = require("socket.io")

let io
let guestNumber = 1
let nickNames = {}
let nameUsed = []
let currentRoom = {}

exports.listen = function(server) {
  // 启动socket服务器，允许搭载在现有的HTTP服务上
  io = socketio(server)
  // 每个用户的连接逻辑
  io.sockets.on('connection', function (socket){
    // 赋予访客名
    guestNumber = assignGuestName(socket, guestNumber, nickNames, nameUsed)
    // 放入Lobby聊天室
    joinRoom(socket, 'Lobby')
    // 处理用户消息
    handleMessageBroadcasting(socket, nickNames)
    // 处理更名信息
    handleNameChangeAttemps(socket, nickNames, nameUsed)
    // 处理加入聊天室
    handleRoomJoining(socket)
    // 用户发出请求时，向其提供已被占用的聊天室列表
    socket.on('rooms', function (){
      socket.emit('roomsResult', findRooms())
    })
    // 处理用户断开后的事务
    handleClientDisconnection(socket, nickNames, nameUsed)
  })
}

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
    name: guestName
  })
  // 用户数增1
  return guestNumber + 1
}

/**
 * 加入房间逻辑
 * @param socket
 * @param room
 */
function joinRoom(socket, room) {
  // 加入
  socket.join(room)
  // 记录用户当前聊天室
  currentRoom[socket.id] = room
  // 让用户知道
  socket.emit('joinResult', {room: room})
  // 让其他用户知道有人进入了
  socket.broadcast.to(room).emit('message', {
    text: nickNames[socket.id] + ' has joined ' + room + '.'
  })
  // 汇总房间内用户
  io.in(room).allSockets().then(function (sockets) {
    if (sockets.size > 1) {
      let userInRoomSummary = 'Users currently in ' + room + '：'
      for (let item of sockets) {
        userInRoomSummary += nickNames[item] + '，'
      }
      userInRoomSummary = userInRoomSummary.substring(0, userInRoomSummary.length - 1)
      userInRoomSummary += '.'
      // 房间用户汇总后发给该用户
      socket.emit('message', {text: userInRoomSummary})
    }
  })

}

/**
 * 更名请求
 * @param socket
 * @param nickNames
 * @param nameUsed
 */
function handleNameChangeAttemps(socket, nickNames, nameUsed) {
  socket.on('nameAttempt', function (name){
    // 禁止Guest开头
    if (name.indexOf('Guest') === 0) {
      socket.emit('nameResult', {
        success: false,
        message: 'Name cannot begin with "Guest".'
      })
    } else if (nameUsed.indexOf(name) !== -1) { // 已被占用
      socket.emit('nameResult', {
        success: false,
        message: 'That name is already in use.'
      })
    } else {
      let previousName = nickNames[socket.id]
      let previousNameIndex = nameUsed.indexOf(previousName)
      delete nameUsed[previousNameIndex]
      nickNames[socket.id] = name
      nameUsed.push(name)
      socket.emit('nameResult', {
        success: true,
        name: name
      })
      // 广播通知改名
      socket.broadcast.to(currentRoom[socket.id]).emit('message', {
        text: previousName + ' is known as ' + name + '.'
      })
    }
  })
}

/**
 * 处理发送的消息
 * @param socket
 */
function handleMessageBroadcasting(socket) {
  socket.on('message', function (message) {
    socket.broadcast.to(currentRoom[socket.id]).emit('message',{
      text: nickNames[socket.id] + '：' + message.text
    })
  })
}

/**
 * 更换房间
 * @param socket
 */
function handleRoomJoining(socket) {
  socket.on('join', function (room){
    socket.leave(currentRoom[socket.id])
    joinRoom(socket, room.newRoom)
  })
}

/**
 * 离开后删除名字和占用
 * @param socket
 */
function handleClientDisconnection(socket) {
  socket.on('disconnect', function (){
    let nameIndex = nameUsed.indexOf(nickNames[socket.id])
    delete nameUsed[nameIndex]
    delete nickNames[socket.id]
  })
}

function findRooms() {
  let availableRooms = [];
  let rooms = io.sockets.adapter.rooms;
  if (rooms) {
    for (let [key, value] of rooms) {
      if (!value.has(key)) {
        availableRooms.push(key);
      }
    }
  }
  return availableRooms;
}