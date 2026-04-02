/*
==============================================================================
                           SNAKE GAME - JAVASCRIPT
==============================================================================

File: script.js
Description: Complete implementation of the classic Snake game using HTML5 Canvas
Author: AI Assistant
Date: April 2, 2026
Version: 1.0

Features:
- Classic Snake gameplay with collision detection
- Progressive difficulty (increasing speed)
- Score tracking with persistent high scores
- Pause/resume functionality
- Responsive controls (Arrow keys, WASD, Space)
- Modern UI with game over screen
- Cross-platform compatible

Game Controls:
- Arrow Keys / WASD: Move snake
- Spacebar: Start game / Pause/Resume
- Click "Play Again": Restart after game over

==============================================================================
*/

/**
 * Snake Game Class - Handles all game logic and rendering
 */
class SnakeGame {
    constructor() {
        // Get DOM elements for game interaction
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Game settings - defines the grid system
        this.gridSize = 20; // Size of each grid square in pixels
        this.tileCount = this.canvas.width / this.gridSize; // Number of tiles across/down
        
        // Game state variables
        this.snake = [{ x: 10, y: 10 }]; // Snake starts as single segment in center
        this.food = {}; // Food position object
        this.dx = 0; // Horizontal movement direction (-1, 0, 1)
        this.dy = 0; // Vertical movement direction (-1, 0, 1)
        this.score = 0; // Current game score
        this.highScore = localStorage.getItem('snakeHighScore') || 0; // Persistent high score
        this.gameRunning = false; // Whether game is actively running
        this.gamePaused = false; // Whether game is paused
        
        // Initialize the game
        this.init();
    }
    
    /**
     * Initialize the game - set up UI, generate first food, and start game loop
     */
    init() {
        this.updateHighScoreDisplay();
        this.generateFood();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    /**
     * Set up all keyboard and button event listeners
     */
    setupEventListeners() {
        // Listen for keyboard input
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        // Listen for restart button clicks
        this.restartBtn.addEventListener('click', () => this.restartGame());
        
        // Prevent default browser behavior for game controls
        // This stops arrow keys from scrolling the page
        window.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    /**
     * Handle all keyboard input for game controls
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyPress(e) {
        // Start game if space is pressed and game isn't running
        if (!this.gameRunning && e.key === ' ') {
            this.startGame();
            return;
        }
        
        // Toggle pause if space is pressed during gameplay
        if (e.key === ' ') {
            this.togglePause();
            return;
        }
        
        // Don't process movement if game is paused or not running
        if (this.gamePaused || !this.gameRunning) return;
        
        // Prevent snake from immediately reversing into itself
        const goingUp = this.dy === -1;
        const goingDown = this.dy === 1;
        const goingRight = this.dx === 1;
        const goingLeft = this.dx === -1;
        
        // Handle directional input (arrow keys or WASD)
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (!goingDown) { // Can't go up if currently going down
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (!goingUp) { // Can't go down if currently going up
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (!goingRight) { // Can't go left if currently going right
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (!goingLeft) { // Can't go right if currently going left
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
        }
    }
    
    /**
     * Start the game - set initial movement direction
     */
    startGame() {
        this.gameRunning = true;
        this.dx = 1; // Start moving right
        this.dy = 0;
    }
    
    /**
     * Toggle between paused and unpaused states
     */
    togglePause() {
        this.gamePaused = !this.gamePaused;
    }
    
    /**
     * Generate food at a random location on the grid
     * Ensures food doesn't spawn on the snake's body
     */
    generateFood() {
        // Generate random coordinates within the grid
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
        
        // Check if food spawned on snake body - if so, try again
        for (let segment of this.snake) {
            if (segment.x === this.food.x && segment.y === this.food.y) {
                this.generateFood(); // Recursive call to find new position
                return;
            }
        }
    }
    
    /**
     * Update game state - move snake, check collisions, handle food consumption
     */
    update() {
        // Don't update if game is paused or not running
        if (!this.gameRunning || this.gamePaused) return;
        
        // Calculate new head position based on current direction
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Check collision with walls (game boundaries)
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Check collision with snake's own body
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        // Add new head to front of snake
        this.snake.unshift(head);
        
        // Check if snake ate food
        if (head.x === this.food.x && head.y === this.food.y) {
            // Snake grows - don't remove tail, increase score, generate new food
            this.score += 10;
            this.updateScore();
            this.generateFood();
        } else {
            // Normal movement - remove tail so snake doesn't grow
            this.snake.pop();
        }
    }
    
    /**
     * Render all game elements to the canvas
     */
    draw() {
        // Clear the entire canvas with black background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw the snake with different colors for head and body
        this.ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            // Make head slightly different color for visual distinction
            if (i === 0) {
                this.ctx.fillStyle = '#66BB6A'; // Lighter green for head
            } else {
                this.ctx.fillStyle = '#4CAF50'; // Standard green for body
            }
            
            // Draw segment with small gap between segments (gridSize - 2)
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        }
        
        // Draw food as red square
        this.ctx.fillStyle = '#FF5722';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
        
        // Show pause indicator when game is paused
        if (this.gamePaused) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
        
        // Show start instruction when game hasn't started
        if (!this.gameRunning) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press SPACE to Start', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    /**
     * Main game loop - updates and renders the game continuously
     * Implements progressive speed increase based on score
     */
    gameLoop() {
        this.update(); // Update game state
        this.draw();   // Render current state
        
        // Progressive difficulty: speed increases as score goes up
        // Starts at 200ms delay, decreases by 10ms every 50 points
        // Minimum speed is 100ms (maximum difficulty)
        const speed = Math.max(100, 200 - Math.floor(this.score / 50) * 10);
        
        // Schedule next frame
        setTimeout(() => this.gameLoop(), speed);
    }
    
    /**
     * Update score display and check for new high score
     */
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        // Check if current score beats high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            // Save new high score to browser's local storage
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScoreDisplay();
        }
    }
    
    /**
     * Update high score display in the UI
     */
    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }
    
    /**
     * Handle game over - stop game and show game over screen
     */
    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('hidden'); // Show game over overlay
    }
    
    /**
     * Reset game to initial state for a new game
     */
    restartGame() {
        // Reset all game state variables to starting values
        this.snake = [{ x: 10, y: 10 }]; // Single segment in center
        this.dx = 0; // No initial movement
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false; // Wait for space to start
        this.gamePaused = false;
        
        // Reset UI elements
        this.scoreElement.textContent = '0';
        this.gameOverElement.classList.add('hidden'); // Hide game over screen
        
        // Place new food on the board
        this.generateFood();
        
        // Redraw the clean game state
        this.draw();
    }
}

// Initialize the game when the page finishes loading
window.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});