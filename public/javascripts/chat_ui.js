const socket = io()
$(document).ready(function (){
  let chatApp = new Chat(socket)

  setInterval(function () {
    socket.emit('rooms')
  }, 1000)

  socket.on('nameResult', function (result){
    let message
    if (result.success) {
      message = 'You are known as ' + result.name + '.'
    } else {
      message = result.message
    }

    $('#messages').append(divSystemContentElement(message))
  })

  socket.on('joinResult', function (result){
    $('#room').text(result.room)
    $('#messages').append(divSystemContentElement('Room changed.'))
  })

  socket.on('message', function (message){
    $('#messages').append(divEscapedContentElement(message.text))
  })

  socket.on('roomsResult', function (rooms) {
    $('#room-list').empty()

    for (let index in rooms) {
      let room = rooms[index]
      if (room) {
        $('#room-list').append(divEscapedContentElement(room))
      }
    }

    $('#room-list div').click(function () {
      chatApp.processCommand('/join ' + $(this).text())
      $('#send-message').focus()
    })

    $('#send-message').focus()
  })

  $('#send-form').submit(function () {
    processUserInput(chatApp, socket)
    return false
  })
})

function divEscapedContentElement(message) {
  return $('<div></div>').text(message)
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>')
}

/**
 * 处理用户指令
 * @param chatApp
 * @param socket
 */
function processUserInput(chatApp, socket) {
  let message = $('#send-message').val()
  if (!message) return

  let systemMessage
  // 指令
  if (message.charAt(0) == '/') {
    systemMessage = chatApp.processCommand(message)
    if (systemMessage) {
      $('#messages').append(divSystemContentElement(systemMessage))
    }
  } else {
    // 将消息广播给其他用户
    chatApp.sendMessage($('#room').text(), message)
    $('#messages').append(divEscapedContentElement(message))
    $('#messages').scrollTop($('#messages').prop('scrollHeight'))
  }
  $('#send-message').val('')
}