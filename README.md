# Tic-Tac-Toe with Limited Counters

A modern twist on the classic Tic-Tac-Toe game featuring limited counters and a movement phase, built with vanilla HTML, CSS, and JavaScript.

## Description

This is an enhanced version of Tic-Tac-Toe where players have a limited number of counters (3 each) and must strategically place and move them to achieve victory. The game includes two distinct phases: placement and movement, adding depth to the traditional gameplay.

## Features

- **Two Game Modes**: Play against another human or challenge the AI
- **Two-Phase Gameplay**:
  - **Placement Phase**: Players place their limited counters on empty cells
  - **Movement Phase**: Once all counters are placed, players can move their pieces to new positions
- **Win Detection**: Traditional 3-in-a-row wins (horizontal, vertical, diagonal)
- **Draw Detection**: Game ends in a draw if the board is full without a winner
- **Visual Feedback**: Selected pieces are highlighted, counters are tracked in real-time
- **Responsive Design**: Clean, centered layout that works on different screen sizes
- **Reset Functionality**: Start a new game at any time

## How to Play

1. **Choose Game Mode**: Select "Human vs Human" or "Human vs AI" from the dropdown
2. **Placement Phase**:
   - Players take turns placing their counters (X or O) on empty cells
   - Each player starts with 3 counters
   - Click on an empty cell to place your counter
3. **Movement Phase** (after all counters are placed):
   - Click on one of your pieces to select it (it will be highlighted)
   - Click on an empty cell to move your selected piece there
   - You can only move your own pieces
4. **Winning**: Get 3 of your counters in a row, column, or diagonal
5. **Reset**: Click the "Reset Game" button to start over

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with flexbox, grid, and transitions
- **JavaScript (ES6+)**: Game logic, DOM manipulation, and AI implementation

## How to Run

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start playing!

No additional dependencies or build tools required - it's a pure client-side application.

## Project Structure

```
tictactoe/
├── index.html      # Main HTML file with game structure
├── styles.css      # CSS styling for the game interface
├── script.js       # JavaScript game logic and AI
└── config.toml     # Configuration file (currently unused)
```

## Game Rules

- Each player has exactly 3 counters
- Players alternate turns
- In placement phase: Place counters on empty cells only
- In movement phase: Select your piece, then choose an empty destination
- Game ends when:
  - A player gets 3 in a row (win)
  - Board is full without a winner (draw)
- AI plays randomly in AI mode

## Browser Support

Works in all modern browsers that support ES6+ JavaScript features.

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).