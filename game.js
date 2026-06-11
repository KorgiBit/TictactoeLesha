function createGame() {
    const board = ['','','','','','','','','']
    let currentPlayer = "X"
    let winner = ''
    let winLine = null
    const players = {X: null, O: null}
    let spectators = []

    let ROUND_TIME = 30
    let timeLeft = ROUND_TIME
    const score = {X: 0, O: 0, draw: 0}

    const rematchVotes = new Set()

    const LINES = [
        [0,1,2],[3,4,5],[6,7,8], // строки
        [0,3,6],[1,4,7],[2,5,8], // столбцы
        [0,4,8],[2,4,6]          // диагонали
    ]
    function voteRematch(socketId) {
        rematchVotes.add(socketId)
        const bothAgreed = players.X && players.O &&
         rematchVotes.has(players.X) && 
         rematchVotes.has(players.O)
        if (bothAgreed) {
            rematchVotes.clear()
            resetGame()
            return true
        }
        return false
    }


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
            score.X = 0
            score.O = 0
            score.draw = 0
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

        timeLeft = ROUND_TIME
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
        if (winner === 'draw') {
        score.draw++
        } else if (winner !== '') {
            score[winner]++
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
        return {board, currentPlayer, winner, winLine, timeLeft, 
            rematchVotes: [...rematchVotes], score}
    }
    function resetGame() {
        board.fill('')
        currentPlayer = "X"
        winner = ''
        winLine = null
        timeLeft = ROUND_TIME
    }
    function tick() {
        if (winner !== '') return false
        timeLeft--
        if (timeLeft <= 0) {
            timeLeft = ROUND_TIME
            currentPlayer = currentPlayer === "X" ? 'O' : 'X'
            return true
        }
        return false
    }

    return {makeMove, getState, resetGame, addPlayer, removePlayer, getCounts, tick,
        voteRematch
    }
}

module.exports = {createGame}