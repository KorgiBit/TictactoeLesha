function createGame() {
    const board = ['','','','','','','','','']
    let currentPlayer = "X"
    let winner = ''
    const LINES = [
        [0,1,2],[3,4,5],[6,7,8], // строки
        [0,3,6],[1,4,7],[2,5,8], // столбцы
        [0,4,8],[2,4,6]          // диагонали
    ]
    function checkWinner() {
        for (const [a,b,c] of LINES) {
            if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
                return board[a]
            }
        }
        return ''
    }

    function makeMove(index) {
        if (winner !== '') return false
        if (board[index] !== '') return false

        board[index] = currentPlayer
        winner = checkWinner()
        if (winner === '') {
            currentPlayer = currentPlayer === "X" ? 'O' : 'X'
        }
        return true
    }
    function getState() {
        return {board, currentPlayer, winner}
    }
    function resetGame() {
        board.fill('')
        currentPlayer = "X"
        winner = ''
    }
    return {makeMove, getState, resetGame}
}

module.exports = {createGame}