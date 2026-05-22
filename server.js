const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const {createGame} = require('./game')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('public'))
const game = createGame()

io.on('connection', (socket) => {
  console.log('Клиент подключился: ', socket.id)
  socket.emit("getState", game.getState())
  socket.on('makeMove', (index) => {
    const ok = game.makeMove(index)
    if (ok) {
      io.emit("getState", game.getState())
    }
  })

  socket.on('resetGame', () => {
    game.resetGame()
    io.emit("getState", game.getState())
  })
  
  socket.on('disconnect', () => {
    console.log('Клиент отключился: ', socket.id)
  })
})

server.listen(3000, () => {
  console.log('Сервер запущен: http://localhost:3000')
})   