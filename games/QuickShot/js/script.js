let gameState = 'waiting'; // waiting, ready, set, go, finished
let startTime;
let playerReactionTime;
let botReactionTime;
let gameTimeout;

const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const startBtn = document.getElementById('startBtn');
const playerTimeEl = document.getElementById('playerTime');
const botTimeEl = document.getElementById('botTime');
const outcomeEl = document.getElementById('outcome');

function startGame() {
    gameState = 'ready';
    resultsEl.style.display = 'none';
    startBtn.style.display = 'none';
    statusEl.className = 'status ready';
    statusEl.textContent = 'Ready...';

    // Random delay between 2-5 seconds for the full sequence
    const readyDelay = 1000 + Math.random() * 1000; // 1-2 seconds
    const setDelay = readyDelay + 1000 + Math.random() * 1000; // +1-2 seconds
    const goDelay = setDelay + 1000 + Math.random() * 2000; // +1-3 seconds

    setTimeout(() => {
        if (gameState !== 'ready') return;
        gameState = 'set';
        statusEl.className = 'status set';
        statusEl.textContent = 'Set...';
    }, readyDelay);

    setTimeout(() => {
        if (gameState !== 'set') return;
        gameState = 'go';
        statusEl.className = 'status go';
        statusEl.textContent = 'GO!';
        startTime = Date.now();
        
        // Generate bot reaction time
        botReactionTime = 200 + Math.random() * 200; // 200-400ms
    }, goDelay);
}

function endGame(tooEarly = false) {
    gameState = 'finished';
    
    if (tooEarly) {
        statusEl.className = 'status too-early';
        statusEl.textContent = 'TOO EARLY! 💥';
        
        // Show try again option immediately for early shots
        showTryAgainOption();
        
    } else {
        playerReactionTime = Date.now() - startTime;
        statusEl.textContent = `${playerReactionTime}ms`;
        
        playerTimeEl.textContent = `You: ${playerReactionTime}ms`;
        botTimeEl.textContent = `Bot: ${botReactionTime.toFixed(0)}ms`;
        
        if (playerReactionTime < botReactionTime) {
            playerTimeEl.className = 'result-item winner';
            botTimeEl.className = 'result-item loser';
            outcomeEl.textContent = `🎉 You win! Lightning fast!`;
            outcomeEl.className = 'result-item winner';
        } else {
            playerTimeEl.className = 'result-item loser';
            botTimeEl.className = 'result-item winner';
            outcomeEl.textContent = `💀 You lose! Bot was faster!`;
            outcomeEl.className = 'result-item loser';
        }
        
        // Send actual reaction time to ArcadeHub (only for completed games)
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'game_end',
                score: playerReactionTime, // Send reaction time in milliseconds
                gameId: 'quickshot'
            }, '*');
        }
        
        // Show full results for completed games
        resultsEl.style.display = 'block';
        startBtn.style.display = 'inline-block';
        startBtn.textContent = 'Play Again';
    }
}

function showTryAgainOption() {
    // Hide results, show try again button
    resultsEl.style.display = 'none';
    startBtn.style.display = 'inline-block';
    startBtn.textContent = 'Try Again';
    
    // Add some encouragement text
    setTimeout(() => {
        if (gameState === 'finished') {
            statusEl.innerHTML = 'TOO EARLY! 💥<br><small style="font-size: 0.5em; color: #666;">Wait for "GO!" next time</small>';
        }
    }, 1000);
}

function resetGame() {
    gameState = 'waiting';
    statusEl.className = 'status';
    statusEl.textContent = 'Press Start to Begin';
    resultsEl.style.display = 'none';
    startBtn.style.display = 'inline-block';
    startBtn.textContent = 'Start Showdown';
    
    // Clear any timeouts
    clearTimeout(gameTimeout);
}

// Event listeners
startBtn.addEventListener('click', () => {
    if (startBtn.textContent === 'Try Again') {
        // Quick restart for too early shots
        startGame();
    } else {
        // Normal start or play again
        startGame();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        
        if (gameState === 'ready' || gameState === 'set') {
            endGame(true); // Too early
        } else if (gameState === 'go') {
            endGame(false); // Normal reaction
        }
    }
    
    // Allow Enter key to restart when showing try again
    if (e.code === 'Enter' && gameState === 'finished' && startBtn.textContent === 'Try Again') {
        startGame();
    }
});

// Reset if player doesn't react within 3 seconds of "GO!"
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState === 'go') {
        clearTimeout(gameTimeout);
    }
});