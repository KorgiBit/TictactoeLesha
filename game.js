function createGame() {
    const board = ['','','','','','','','','']
    let currentPlayer = "X"
    let winner = ''
    let winLine = null
    const players = {X: null, O: null}
    let spectators = []

    const LINES = [
        [0,1,2],[3,4,5],[6,7,8], // строки
        [0,3,6],[1,4,7],[2,5,8], // столбцы
        [0,4,8],[2,4,6]          // диагонали
    ]
    function checkWinner() {
        for (const [a,b,c] of LINES) {
            const line = [a,b,c]
            if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
                return {mark: board[a], line}
            }
        }
        return {mark: '', line: null}
    }

    function addPlayer(socketId) {
        if (players.X === null) {
            players.X = socketId
            return "X"
        }
        if (players.O === null) {
            players.O = socketId
            return "O"
        }
        spectators.push(socketId)
        return 'spectator'
    }

    function removePlayer(socketId) {
        if (players.X === socketId || players.O === socketId) {
            players.X = null
            players.O = null
            spectators = []
            resetGame()
            return true
        }
        spectators = spectators.filter(id => id !== socketId)
        return false
    }

    function makeMove(index, socketId) {
        if (winner !== '') return false
        if (board[index] !== '') return false
        if (players[currentPlayer] !== socketId) return false

        board[index] = currentPlayer
        const result = checkWinner()
        winner = result.mark
        winLine = result.line
        if (winner === '') {
            if (board.every(cell => cell !== '')) {
                winner = 'draw'
            } 
            else {
                currentPlayer = currentPlayer === "X" ? 'O' : 'X'
            }
        }
        return true
    }
    function getCounts() {
        let playersCount = 0
        if (players.X) playersCount++
        if (players.O) playersCount++
        return {playersCount, spectatorsCount: spectators.length}
    }

    function getState() {
        return {board, currentPlayer, winner, winLine}
    }
    function resetGame() {
        board.fill('')
        currentPlayer = "X"
        winner = ''
        winLine = null
    }
    return {makeMove, getState, resetGame, addPlayer, removePlayer, getCounts}
}

module.exports = {createGame}