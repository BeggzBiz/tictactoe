const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.querySelector('.status');
const xCountersDisplay = document.getElementById('x-counters');
const oCountersDisplay = document.getElementById('o-counters');
const modeSelect = document.getElementById('mode-select');
const difficultySelect = document.getElementById('difficulty-select');
const difficultyContainer = document.getElementById('difficulty-container');
const resetBtn = document.getElementById('reset-btn');

let gameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    counters: { X: 3, O: 3 },
    phase: 'placement', // 'placement' or 'movement'
    selectedCell: null,
    gameMode: 'human',
    difficulty: 1,
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
    gameState.difficulty = parseInt(difficultySelect.value);
    updateDifficultyVisibility();
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

function updateDifficultyVisibility() {
    if (gameState.gameMode === 'ai') {
        difficultyContainer.style.display = 'block';
    } else {
        difficultyContainer.style.display = 'none';
    }
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

function getAvailableMoves() {
    if (gameState.phase === 'placement') {
        return gameState.board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);
    } else {
        // Movement phase
        const playerPieces = gameState.board.map((cell, index) => cell === 'O' ? index : null).filter(index => index !== null);
        const emptyCells = gameState.board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);

        const moves = [];
        playerPieces.forEach(pieceIndex => {
            emptyCells.forEach(emptyIndex => {
                moves.push({ from: pieceIndex, to: emptyIndex });
            });
        });
        return moves;
    }
}

function getWinningMove(player) {
    const availableMoves = getAvailableMoves();

    for (let move of availableMoves) {
        // Simulate the move
        const tempBoard = [...gameState.board];
        const tempCounters = { ...gameState.counters };

        if (gameState.phase === 'placement') {
            tempBoard[move] = player;
            tempCounters[player]--;
        } else {
            tempBoard[move.to] = player;
            tempBoard[move.from] = null;
        }

        // Check if this creates a win
        if (isWinningBoard(tempBoard, player)) {
            return move;
        }
    }
    return null;
}

function isWinningBoard(board, player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];

    return winPatterns.some(pattern => {
        return pattern.every(index => board[index] === player);
    });
}

function getStrategicPlacementMoves() {
    const availableMoves = getAvailableMoves();
    if (gameState.phase !== 'placement') return availableMoves;

    // Prioritize center, then corners, then edges
    const priorities = [
        [4], // center
        [0, 2, 6, 8], // corners
        [1, 3, 5, 7] // edges
    ];

    const prioritizedMoves = [];
    priorities.forEach(priority => {
        priority.forEach(index => {
            if (availableMoves.includes(index)) {
                prioritizedMoves.push(index);
            }
        });
    });

    return prioritizedMoves;
}

function makeAIMove() {
    if (gameState.gameOver) return;

    let move;
    switch (gameState.difficulty) {
        case 1:
            move = makeLevel1Move();
            break;
        case 2:
            move = makeLevel2Move();
            break;
        case 3:
            move = makeLevel3Move();
            break;
        case 4:
            move = makeLevel4Move();
            break;
        default:
            move = makeLevel1Move();
    }

    if (!move) return;

    if (gameState.phase === 'placement') {
        placeCounter(move);
    } else {
        gameState.selectedCell = move.from;
        handleMovement(move.to);
    }

    renderBoard();
    updateStatus();
}

function makeLevel1Move() {
    // Level 1: Check for immediate wins/blocks, otherwise random
    const availableMoves = getAvailableMoves();

    // Check for winning move
    const winningMove = getWinningMove('O');
    if (winningMove) {
        return winningMove;
    }

    // Check for blocking move
    const blockingMove = getWinningMove('X');
    if (blockingMove) {
        return blockingMove;
    }

    // Random move with some randomization
    if (Math.random() < 0.8) { // 80% chance to pick random
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
        // 20% chance to pick a "smart" random (prefer center/corners in placement)
        if (gameState.phase === 'placement') {
            const strategicMoves = getStrategicPlacementMoves();
            return strategicMoves[Math.floor(Math.random() * strategicMoves.length)];
        } else {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    }
}

function makeLevel2Move() {
    // Level 2: Strategic placement with wins/blocks
    const availableMoves = getAvailableMoves();

    // Check for winning move
    const winningMove = getWinningMove('O');
    if (winningMove) {
        return winningMove;
    }

    // Check for blocking move
    const blockingMove = getWinningMove('X');
    if (blockingMove) {
        return blockingMove;
    }

    // Strategic placement in placement phase
    if (gameState.phase === 'placement') {
        const strategicMoves = getStrategicPlacementMoves();
        // 70% chance to pick strategic, 30% random
        if (Math.random() < 0.7) {
            return strategicMoves[0]; // Best strategic move
        } else {
            return strategicMoves[Math.floor(Math.random() * strategicMoves.length)];
        }
    } else {
        // Movement phase: prefer moves that create threats
        const threatMoves = availableMoves.filter(move => {
            // Simulate move and check if it creates a threat
            const tempBoard = [...gameState.board];
            tempBoard[move.to] = 'O';
            tempBoard[move.from] = null;
            return getWinningMove('O') !== null; // If this move creates a winning opportunity next turn
        });

        if (threatMoves.length > 0 && Math.random() < 0.6) {
            return threatMoves[Math.floor(Math.random() * threatMoves.length)];
        }

        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
}

function makeLevel3Move() {
    // Level 3: Depth-limited minimax with randomization
    const availableMoves = getAvailableMoves();

    // Check for winning move
    const winningMove = getWinningMove('O');
    if (winningMove) {
        return winningMove;
    }

    // Check for blocking move
    const blockingMove = getWinningMove('X');
    if (blockingMove) {
        return blockingMove;
    }

    // Use minimax for best move
    let bestMove = null;
    let bestScore = -Infinity;

    for (let move of availableMoves) {
        const score = minimax(move, 2, false); // Depth 2 for reasonable performance
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    // Add some randomization - 20% chance to pick a suboptimal move
    if (Math.random() < 0.2 && availableMoves.length > 1) {
        const otherMoves = availableMoves.filter(m => m !== bestMove);
        return otherMoves[Math.floor(Math.random() * otherMoves.length)];
    }

    return bestMove || availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function makeLevel4Move() {
    // Level 4: Expert - Deep minimax with alpha-beta pruning and strategic evaluation
    const availableMoves = getAvailableMoves();

    // Check for winning move
    const winningMove = getWinningMove('O');
    if (winningMove) {
        return winningMove;
    }

    // Check for blocking move
    const blockingMove = getWinningMove('X');
    if (blockingMove) {
        return blockingMove;
    }

    // Use deep minimax with alpha-beta pruning and move ordering
    const orderedMoves = orderMoves(availableMoves);
    let bestMove = null;
    let bestScore = -Infinity;

    // Use much deeper search for true expert play
    const depth = gameState.phase === 'placement' ? 6 : 5;

    for (let move of orderedMoves) {
        const score = minimaxAlphaBeta(move, depth, -Infinity, Infinity, false);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove || availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function minimax(move, depth, isMaximizing) {
    // Simulate the move
    const originalBoard = [...gameState.board];
    const originalCounters = { ...gameState.counters };
    const originalPhase = gameState.phase;

    if (gameState.phase === 'placement') {
        gameState.board[move] = isMaximizing ? 'O' : 'X';
        gameState.counters[isMaximizing ? 'O' : 'X']--;
    } else {
        gameState.board[move.to] = isMaximizing ? 'O' : 'X';
        gameState.board[move.from] = null;
    }

    // Check if all counters are placed
    if (gameState.counters.X === 0 && gameState.counters.O === 0 && gameState.phase === 'placement') {
        gameState.phase = 'movement';
    }

    let score;
    if (depth === 0 || isWinningBoard(gameState.board, 'O') || isWinningBoard(gameState.board, 'X')) {
        score = evaluateBoard();
    } else {
        const availableMoves = getAvailableMoves();
        if (isMaximizing) {
            score = -Infinity;
            for (let nextMove of availableMoves) {
                score = Math.max(score, minimax(nextMove, depth - 1, false));
            }
        } else {
            score = Infinity;
            for (let nextMove of availableMoves) {
                score = Math.min(score, minimax(nextMove, depth - 1, true));
            }
        }
    }

    // Restore state
    gameState.board = originalBoard;
    gameState.counters = originalCounters;
    gameState.phase = originalPhase;

    return score;
}

function evaluateBoard() {
    if (isWinningBoard(gameState.board, 'O')) return 1000;
    if (isWinningBoard(gameState.board, 'X')) return -1000;

    let score = 0;
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];

    // Evaluate each winning pattern
    for (let pattern of winPatterns) {
        let oCount = 0, xCount = 0, emptyCount = 0;
        for (let index of pattern) {
            if (gameState.board[index] === 'O') oCount++;
            else if (gameState.board[index] === 'X') xCount++;
            else emptyCount++;
        }

        if (oCount === 3) score += 100; // AI wins
        else if (xCount === 3) score -= 100; // Human wins
        else if (oCount === 2 && emptyCount === 1) score += 10; // AI has 2 in a row
        else if (xCount === 2 && emptyCount === 1) score -= 10; // Human has 2 in a row
        else if (oCount === 1 && emptyCount === 2) score += 1; // AI has 1 in a row
        else if (xCount === 1 && emptyCount === 2) score -= 1; // Human has 1 in a row
    }

    // Bonus for center control (most important position)
    if (gameState.board[4] === 'O') score += 3;
    else if (gameState.board[4] === 'X') score -= 3;

    // Bonus for corner control
    const corners = [0, 2, 6, 8];
    for (let corner of corners) {
        if (gameState.board[corner] === 'O') score += 2;
        else if (gameState.board[corner] === 'X') score -= 2;
    }

    // In movement phase, consider mobility
    if (gameState.phase === 'movement') {
        const oPieces = gameState.board.filter(cell => cell === 'O').length;
        const xPieces = gameState.board.filter(cell => cell === 'X').length;
        score += (oPieces - xPieces) * 2; // More pieces = more mobility
    }

    return score;
}

function orderMoves(moves) {
    if (gameState.phase === 'placement') {
        // Order by strategic value: center, corners, edges
        const centerMoves = moves.filter(move => move === 4);
        const cornerMoves = moves.filter(move => [0, 2, 6, 8].includes(move));
        const edgeMoves = moves.filter(move => [1, 3, 5, 7].includes(move));

        return [...centerMoves, ...cornerMoves, ...edgeMoves];
    } else {
        // In movement phase, prioritize moves that:
        // 1. Create immediate threats
        // 2. Block opponent threats
        // 3. Improve position

        return moves.sort((a, b) => {
            // Simulate move A
            const boardA = [...gameState.board];
            boardA[a.to] = 'O';
            boardA[a.from] = null;

            // Simulate move B
            const boardB = [...gameState.board];
            boardB[b.to] = 'O';
            boardB[b.from] = null;

            const scoreA = evaluateMove(boardA);
            const scoreB = evaluateMove(boardB);

            return scoreB - scoreA; // Higher score first
        });
    }
}

function evaluateMove(board) {
    let score = 0;

    // Check for immediate win
    if (isWinningBoard(board, 'O')) return 1000;
    if (isWinningBoard(board, 'X')) return -1000;

    // Evaluate patterns
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let pattern of winPatterns) {
        let oCount = 0, xCount = 0;
        for (let index of pattern) {
            if (board[index] === 'O') oCount++;
            else if (board[index] === 'X') xCount++;
        }

        if (oCount === 2 && xCount === 0) score += 50; // Potential win
        else if (xCount === 2 && oCount === 0) score -= 50; // Block needed
        else if (oCount === 1 && xCount === 0) score += 5;
        else if (xCount === 1 && oCount === 0) score -= 5;
    }

    // Center and corner bonuses
    if (board[4] === 'O') score += 10;
    const corners = [0, 2, 6, 8];
    for (let corner of corners) {
        if (board[corner] === 'O') score += 5;
    }

    return score;
}

function minimaxAlphaBeta(move, depth, alpha, beta, isMaximizing) {
    // Simulate the move
    const originalBoard = [...gameState.board];
    const originalCounters = { ...gameState.counters };
    const originalPhase = gameState.phase;

    if (gameState.phase === 'placement') {
        gameState.board[move] = isMaximizing ? 'O' : 'X';
        gameState.counters[isMaximizing ? 'O' : 'X']--;
    } else {
        gameState.board[move.to] = isMaximizing ? 'O' : 'X';
        gameState.board[move.from] = null;
    }

    // Check if all counters are placed - transition to movement phase
    if (gameState.counters.X === 0 && gameState.counters.O === 0 && gameState.phase === 'placement') {
        gameState.phase = 'movement';
    }

    let score;

    // Terminal conditions
    if (isWinningBoard(gameState.board, 'O')) {
        score = 1000 - depth; // Prefer quicker wins
    } else if (isWinningBoard(gameState.board, 'X')) {
        score = -1000 + depth; // Prefer delaying losses
    } else if (depth === 0) {
        score = evaluateBoard();
    } else {
        const availableMoves = orderMoves(getAvailableMoves());

        if (availableMoves.length === 0) {
            // No moves available - this shouldn't happen in normal play
            score = 0;
        } else if (isMaximizing) {
            score = -Infinity;
            for (let nextMove of availableMoves) {
                const moveScore = minimaxAlphaBeta(nextMove, depth - 1, alpha, beta, false);
                score = Math.max(score, moveScore);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
        } else {
            score = Infinity;
            for (let nextMove of availableMoves) {
                const moveScore = minimaxAlphaBeta(nextMove, depth - 1, alpha, beta, true);
                score = Math.min(score, moveScore);
                beta = Math.min(beta, score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
        }
    }

    // Restore state
    gameState.board = originalBoard;
    gameState.counters = originalCounters;
    gameState.phase = originalPhase;

    return score;
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
    updateDifficultyVisibility();
});
difficultySelect.addEventListener('change', () => {
    gameState.difficulty = parseInt(difficultySelect.value);
});

// Initialize the game
initGame();