const socket = io()

const statusEl = document.getElementById("status")
const boardEl  = document.getElementById("board")
const resetButtonEl = document.getElementById("resetButton")
const cells = document.querySelectorAll('.cell')

function handleCellClick(event) {
  const cell = event.target
  const index = Number(cell.dataset.index)
  socket.emit('makeMove', index)
}
cells.forEach(cell => {
  cell.addEventListener('click', handleCellClick)
})

function renderBoard(state) {
  const gameOver = state.winner !== ''
  cells.forEach(cell => {
    const index = Number(cell.dataset.index)
    const mark = state.board[index]

    cell.textContent = mark
    cell.disabled = mark !== ''
    cell.classList.remove('x', 'o')
    if (mark !== '') {
      cell.classList.add(mark.toLowerCase())
    }
  })
  if (gameOver) {
    statusEl.textContent = `Победитель: ${state.winner}`
  } else {
    statusEl.textContent = `Ход: ${state.currentPlayer}`
  }
}

resetButtonEl.addEventListener('click', () => {
  socket.emit('resetGame')
})

socket.on('getState', (state) => {
  renderBoard(state)
})

socket.on('connect', () => {
  console.log('Подключение к серверу установлено: ', socket.id)
})

socket.on('disconnect', () => {
  console.log('Подключение к серверу разорвано: ', socket.id)
})      