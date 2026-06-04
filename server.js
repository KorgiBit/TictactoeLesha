const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const { createGame } = require('./game')

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('public'))

const games = {}
const timers = {}

function startTimer(roomId) {
    clearInterval(timers[roomId])
    timers[roomId] = setInterval(() => {
        const game = getGame(roomId)
        game.tick()
        io.to(roomId).emit('getState', game.getState())
    }, 1000)
}

function stopTimer(roomId) {
    clearInterval(timers[roomId])
    delete timers[roomId]
}

function getGame(roomId) {
    if (!games[roomId]) {
        games[roomId] = createGame()
    }
    return games[roomId]
}

function sendRoomInfo(roomId) {
    const game = getGame(roomId)
    const counts = game.getCounts()
    io.to(roomId).emit('roomInfo', {
        roomId,
        playersCount: counts.playersCount,
        spectatorsCount: counts.spectatorsCount
    })
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
        socket.emit('getState', game.getState())
        sendRoomInfo(roomId)
        const counts = game.getCounts()
        if (counts.playersCount === 2 && !timers[roomId]) {
            startTimer(roomId)
        }
    })

    socket.on('makeMove', (index) => {
        if (!roomId) return
        const game = getGame(roomId)
        const ok = game.makeMove(index, socket.id)
        if (ok) {
            io.to(roomId).emit('getState', game.getState())
            startTimer(roomId)
        }
    })

    socket.on('resetGame', () => {
        if (!roomId) return
        const game = getGame(roomId)
        game.resetGame()
        io.to(roomId).emit('getState', game.getState())
        startTimer(roomId)
    })

    socket.on('disconnect', () => {
        console.log('Клиент отключился: ', socket.id)
        if (!roomId) return
        const game = getGame(roomId)
        const wasPlayer = game.removePlayer(socket.id)
        if (wasPlayer) {
            stopTimer(roomId)
            io.to(roomId).emit('getState', game.getState())
        }
        sendRoomInfo(roomId)
    })
})

server.listen(3000, () => {
    console.log('Сервер запущен: http://localhost:3000')
})