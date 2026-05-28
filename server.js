const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const {createGame} = require('./game')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('public'))

const games = {}
function getGame(roomId) {
    if (!games[roomId]) {
        games[roomId] = createGame()
    }
    return games[roomId]
}

io.on('connection', (socket) => {
  console.log('Клиент подключился: ', socket.id)
  let roomId = null
  socket.on('joinRoom', (room) => {
    roomId = room
    socket.join(roomId)
    const game = getGame(roomId)
    const role = game.addPlayer(socket.id)
    socket.emit('role', role)
    socket.emit("getState", game.getState())
  })

  socket.on('makeMove', (index) => {
    if (!roomId) return
    const game = getGame(roomId)
    const ok = game.makeMove(index, socket.id)
    if (ok) {
      io.emit("getState", game.getState())
    }
  })

  socket.on('resetGame', () => {
    if (!roomId) return
    const game = getGame(roomId)
    game.resetGame()
    io.emit("getState", game.getState())
  })
  
  socket.on('disconnect', () => {
    console.log('Клиент отключился: ', socket.id)
    if (!roomId) return
    const game = getGame(roomId)
    const wasPlayer = game.removePlayer(socket.id)
    if (wasPlayer) {
      io.emit("getState", game.getState())
    }
  })
})

server.listen(3000, () => {
  console.log('Сервер запущен: http://localhost:3000')
})   