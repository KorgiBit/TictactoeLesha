const socket = io()

const statusEl = document.getElementById('status')
const boardEl = document.getElementById('board')
const resetButtonEl = document.getElementById('resetButton')
const cells = document.querySelectorAll('.cell')

const lobbyEl = document.getElementById('lobby')
const gameEl = document.getElementById('game')
const roomInputEl = document.getElementById('roomInput')
const joinButtonEl = document.getElementById('joinButton')
const roomInfoEl = document.getElementById('roomInfo')
const timerEl = document.getElementById('timer')

let myRole = null
let lastState = null

joinButtonEl.addEventListener('click', () => {
    const room = roomInputEl.value.trim()
    if (room === '') return
    socket.emit('joinRoom', room)
    lobbyEl.style.display = 'none'
    gameEl.style.display = 'flex'
})

function handleCellClick(event) {
    const cell = event.target
    const index = Number(cell.dataset.index)
    socket.emit('makeMove', index)
}
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick)
})

function renderBoard(state) {
    lastState = state
    const gameOver = state.winner !== ''
    const isSpectator = myRole === 'spectator'
    const myTurn = myRole === state.currentPlayer

    cells.forEach(cell => {
        const index = Number(cell.dataset.index)
        const mark = state.board[index]

        cell.textContent = mark
        cell.disabled = mark !== '' || gameOver || isSpectator || !myTurn

        cell.classList.remove('x', 'o', 'win')
        if (mark !== '') {
            cell.classList.add(mark.toLowerCase())
        }
    })

    if (state.winLine) {
        state.winLine.forEach(index => {
            cells[index].classList.add('win')
        })
    }

    if (isSpectator) {
        let info
        if (state.winner === 'draw') info = 'ничья'
        else if (gameOver) info = `победил ${state.winner}`
        else info = `ход ${state.currentPlayer}`
        statusEl.textContent = `Вы наблюдатель. ${info}`
    }
    else if (state.winner === 'draw') {
        statusEl.textContent = 'Ничья!'
    }
    else if (gameOver) {
        statusEl.textContent = `Победитель: ${state.winner}`
    }
    else if (myTurn) {
        statusEl.textContent = `Ваш ход: ${state.currentPlayer}`
    }
    else {
        statusEl.textContent = `Ожидание хода игрока ${state.currentPlayer}`
    }
    timerEl.textContent = `Осталось времени: ${state.timeLeft} сек.`
}

resetButtonEl.addEventListener('click', () => {
    socket.emit('resetGame')
})

socket.on('role', (role) => {
    myRole = role
    if (lastState) renderBoard(lastState)
})

socket.on('getState', (state) => {
    renderBoard(state)
})

socket.on('roomInfo', (info) => {
    roomInfoEl.textContent = `Комната: ${info.roomId} / Игроков: ${info.playersCount} / Зрителей: ${info.spectatorsCount}`
})

socket.on('connect', () => {
    console.log('Подключение к серверу установлено: ', socket.id)
})

socket.on('disconnect', () => {
    console.log('Подключение к серверу разорвано: ', socket.id)
})