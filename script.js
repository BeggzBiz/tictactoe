const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.querySelector('.status');
const xCountersDisplay = document.getElementById('x-counters');
const oCountersDisplay = document.getElementById('o-counters');
const modeSelect = document.getElementById('mode-select');
const resetBtn = document.getElementById('reset-btn');

let gameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    counters: { X: 3, O: 3 },
    phase: 'placement', // 'placement' or 'movement'
    selectedCell: null,
    gameMode: 'human',
    gameOver: false
};

function initGame() {
    gameState.board = Array(9).fill(null);
    gameState.currentPlayer = 'X';
    gameState.counters = { X: 3, O: 3 };
    gameState.phase = 'placement';
    gameState.selectedCell = null;
    gameState.gameOver = false;
    gameState.gameMode = modeSelect.value;
    renderBoard();
    updateStatus();
}

function renderBoard() {
    cells.forEach((cell, index) => {
        cell.textContent = gameState.board[index];
        cell.classList.remove('selected');
        if (gameState.selectedCell === index) {
            cell.classList.add('selected');
        }
    });
    xCountersDisplay.textContent = gameState.counters.X;
    oCountersDisplay.textContent = gameState.counters.O;
}

function updateStatus() {
    if (gameState.gameOver) {
        statusDisplay.textContent = `Game Over! ${gameState.currentPlayer} wins!`;
        return;
    }

    if (gameState.phase === 'placement') {
        statusDisplay.textContent = `Player ${gameState.currentPlayer}'s turn - Place your counter`;
    } else {
        if (gameState.selectedCell === null) {
            statusDisplay.textContent = `Player ${gameState.currentPlayer}'s turn - Select a piece to move`;
        } else {
            statusDisplay.textContent = `Player ${gameState.currentPlayer}'s turn - Select destination`;
        }
    }
}

function handleCellClick(index) {
    if (gameState.gameOver) return;

    if (gameState.phase === 'placement') {
        if (gameState.board[index] !== null) return;
        placeCounter(index);
    } else {
        handleMovement(index);
    }

    renderBoard();
    updateStatus();

    if (!gameState.gameOver && gameState.gameMode === 'ai' && gameState.currentPlayer === 'O') {
        setTimeout(makeAIMove, 500);
    }
}

function placeCounter(index) {
    gameState.board[index] = gameState.currentPlayer;
    gameState.counters[gameState.currentPlayer]--;

    if (checkWin()) {
        gameState.gameOver = true;
        return;
    }

    if (checkDraw()) {
        gameState.gameOver = true;
        statusDisplay.textContent = "It's a draw!";
        return;
    }

    // Check if all counters are placed
    if (gameState.counters.X === 0 && gameState.counters.O === 0) {
        gameState.phase = 'movement';
    }

    switchPlayer();
}

function handleMovement(index) {
    if (gameState.selectedCell === null) {
        // Select a piece
        if (gameState.board[index] === gameState.currentPlayer) {
            gameState.selectedCell = index;
        }
    } else {
        // Move to destination
        if (gameState.board[index] === null) {
            gameState.board[index] = gameState.currentPlayer;
            gameState.board[gameState.selectedCell] = null;
            gameState.selectedCell = null;

            if (checkWin()) {
                gameState.gameOver = true;
                return;
            }

            if (checkDraw()) {
                gameState.gameOver = true;
                statusDisplay.textContent = "It's a draw!";
                return;
            }

            switchPlayer();
        } else {
            // Deselect if clicked on occupied cell
            gameState.selectedCell = null;
        }
    }
}

function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
}

function checkWin() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];

    return winPatterns.some(pattern => {
        return pattern.every(index => gameState.board[index] === gameState.currentPlayer);
    });
}

function checkDraw() {
    return gameState.board.every(cell => cell !== null) && !checkWin();
}

function makeAIMove() {
    if (gameState.gameOver) return;

    let availableMoves = [];

    if (gameState.phase === 'placement') {
        availableMoves = gameState.board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);
    } else {
        // Movement phase
        const playerPieces = gameState.board.map((cell, index) => cell === 'O' ? index : null).filter(index => index !== null);
        const emptyCells = gameState.board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);

        playerPieces.forEach(pieceIndex => {
            emptyCells.forEach(emptyIndex => {
                availableMoves.push({ from: pieceIndex, to: emptyIndex });
            });
        });
    }

    if (availableMoves.length === 0) return;

    let move;
    if (gameState.phase === 'placement') {
        move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        placeCounter(move);
    } else {
        move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        gameState.selectedCell = move.from;
        handleMovement(move.to);
    }

    renderBoard();
    updateStatus();
}

function resetGame() {
    initGame();
}

// Event listeners
cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(index));
});

resetBtn.addEventListener('click', resetGame);
modeSelect.addEventListener('change', () => {
    gameState.gameMode = modeSelect.value;
});

// Initialize the game
initGame();