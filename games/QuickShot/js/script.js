let gameState = 'waiting'; // waiting, ready, set, go, finished
let startTime;
let player1ReactionTime;
let player2ReactionTime;
let winner = null;
let gameTimeout;
let gameMode = null; // 'practice' or 'versus'

// Tournament mode variables
let tournamentActive = false;
let tournamentBestOf = 3;
let tournamentWins = { 1: 0, 2: 0 };
let tournamentGamesPlayed = 0;

const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const startBtn = document.getElementById('startBtn');
const player1TimeEl = document.getElementById('player1Time');
const player2TimeEl = document.getElementById('player2Time');
const outcomeEl = document.getElementById('outcome');

const mainMenu = document.getElementById('mainMenu');
const practiceBtn = document.getElementById('practiceBtn');
const versusBtn = document.getElementById('versusBtn');
const gameContainer = document.getElementById('gameContainer');
const instructionsEl = document.getElementById('instructions');
const spaceHintEl = document.getElementById('spaceHint');
const backMenuBtn = document.getElementById('backMenuBtn');

const tournamentBtn = document.getElementById('tournamentBtn');
const tournamentOptions = document.getElementById('tournamentOptions');
const tournamentSelect = document.getElementById('tournamentSelect');
const startTournamentBtn = document.getElementById('startTournamentBtn');
const tournamentScore = document.getElementById('tournamentScore');

// Remove old tournamentOptions logic and use tournamentSetup in game screen
const tournamentSetup = document.getElementById('tournamentSetup');

function showMenu() {
    mainMenu.style.display = 'block';
    gameContainer.style.display = 'none';
    document.querySelector('.title-box').style.display = '';
    document.getElementById('gameTitleBox').style.display = 'none';
    tournamentActive = false;
    tournamentScore.style.display = 'none';
    tournamentSetup.style.display = 'none';
}
function showGame(mode) {
    gameMode = mode;
    mainMenu.style.display = 'none';
    gameContainer.style.display = 'block';
    resultsEl.style.display = 'none';
    startBtn.style.display = 'inline-block';
    statusEl.textContent = 'Press Start to Begin';
    statusEl.className = 'status';
    document.querySelector('.title-box').style.display = 'none';
    document.getElementById('gameTitleBox').style.display = '';
    if (mode === 'practice') {
        instructionsEl.innerHTML = 'Wait for "GO!" then press <strong>A</strong> (or <strong>Space</strong>) as fast as you can!<br>Don\'t press early or you lose!';
        spaceHintEl.innerHTML = 'Press <strong>A</strong> or <strong>Space</strong> when you see "GO!"';
        player2TimeEl.style.display = 'none';
    } else if (mode === 'versus' || mode === 'tournament') {
        instructionsEl.innerHTML = 'Wait for "GO!" then Player 1 press <strong>A</strong> and Player 2 press <strong>L</strong> as fast as you can!<br>Don\'t press early or you lose!';
        spaceHintEl.innerHTML = 'Player 1: Press <strong>A</strong> | Player 2: Press <strong>L</strong> when you see "GO!"';
        player2TimeEl.style.display = '';
    } else if (mode === 'tournament-setup') {
        tournamentSetup.style.display = '';
        tournamentScore.style.display = 'none';
        startBtn.style.display = 'none';
        instructionsEl.innerHTML = 'Select how many games to play in the tournament.';
        statusEl.textContent = '';
    }
    player1TimeEl.textContent = '';
    player2TimeEl.textContent = '';
    outcomeEl.textContent = '';
}

practiceBtn.addEventListener('click', () => showGame('practice'));
versusBtn.addEventListener('click', () => showGame('versus'));

// Show tournament options when Tournament Mode is clicked
if (tournamentBtn) {
  tournamentBtn.addEventListener('click', () => {
    showGame('tournament-setup');
    tournamentSetup.style.display = '';
    tournamentScore.style.display = 'none';
    startBtn.style.display = 'none';
    instructionsEl.innerHTML = 'Select how many games to play in the tournament.';
    statusEl.textContent = '';
  });
}

// Start tournament when Start Tournament is clicked
if (startTournamentBtn) {
  startTournamentBtn.addEventListener('click', () => {
    tournamentBestOf = parseInt(tournamentSelect.value, 10);
    tournamentWins = { 1: 0, 2: 0 };
    tournamentGamesPlayed = 0;
    tournamentActive = true;
    tournamentSetup.style.display = 'none';
    showGame('tournament');
    updateTournamentScore();
    tournamentScore.style.display = '';
    startBtn.style.display = 'inline-block';
    statusEl.textContent = 'Press Start to Begin';
  });
}

function updateTournamentScore() {
  tournamentScore.innerHTML = `Tournament (Best of ${tournamentBestOf})<br><span class='tournament-player1' style='display: inline-block; min-width: 120px;'>Player 1: ${tournamentWins[1]} Wins</span> <span class='tournament-player2' style='display: inline-block; min-width: 120px;'>Player 2: ${tournamentWins[2]} Wins</span>`;
}

showMenu();

let endGameCalled = false;

function startGame() {
    gameState = 'ready';
    resultsEl.style.display = 'none';
    startBtn.style.display = 'none';
    statusEl.className = 'status ready';
    statusEl.textContent = 'Ready...';
    player1ReactionTime = null;
    player2ReactionTime = null;
    winner = null;
    clearTimeout(gameTimeout);
    gameTimeout = null;
    endGameCalled = false;

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
        // botReactionTime = 200 + Math.random() * 200; // 200-400ms
    }, goDelay);
}

function endGame(tooEarly = false, earlyPlayer = null) {
    if (endGameCalled) return;
    endGameCalled = true;
    gameState = 'finished';
    
    if (tooEarly) {
        statusEl.className = 'status too-early';
        statusEl.textContent = 'TOO EARLY! 💥';
        if (earlyPlayer === 1) {
            player1TimeEl.textContent = `Player 1: Shot too early!`;
            player1TimeEl.className = 'result-item loser';
            player2TimeEl.textContent = `Player 2: Wins by default!`;
            player2TimeEl.className = 'result-item winner';
            outcomeEl.textContent = `💀 Player 1 loses!`;
            outcomeEl.className = 'result-item loser';
        } else if (earlyPlayer === 2) {
            player2TimeEl.textContent = `Player 2: Shot too early!`;
            player2TimeEl.className = 'result-item loser';
            player1TimeEl.textContent = `Player 1: Wins by default!`;
            player1TimeEl.className = 'result-item winner';
            outcomeEl.textContent = `💀 Player 2 loses!`;
            outcomeEl.className = 'result-item loser';
        }
    } else {
        player1TimeEl.textContent = typeof player1ReactionTime === 'number' ? `Player 1: ${player1ReactionTime}ms` : `Player 1: No reaction`;
        player2TimeEl.textContent = typeof player2ReactionTime === 'number' ? `Player 2: ${player2ReactionTime}ms` : `Player 2: No reaction`;
        
        if (
            typeof player1ReactionTime === 'number' &&
            typeof player2ReactionTime === 'number'
        ) {
            if (player1ReactionTime < player2ReactionTime) {
                player1TimeEl.className = 'result-item winner';
                player2TimeEl.className = 'result-item loser';
                outcomeEl.textContent = `🎉 Player 1 wins!`;
                outcomeEl.className = 'result-item winner';
            } else if (player2ReactionTime < player1ReactionTime) {
                player2TimeEl.className = 'result-item winner';
                player1TimeEl.className = 'result-item loser';
                outcomeEl.textContent = `🎉 Player 2 wins!`;
                outcomeEl.className = 'result-item winner';
            } else {
                player1TimeEl.className = 'result-item';
                player2TimeEl.className = 'result-item';
                outcomeEl.textContent = `🤝 It's a tie!`;
                outcomeEl.className = 'result-item';
            }
        } else if (typeof player1ReactionTime === 'number') {
            player1TimeEl.className = 'result-item winner';
            player2TimeEl.className = 'result-item';
            outcomeEl.textContent = `🎉 Player 1 wins by default!`;
            outcomeEl.className = 'result-item winner';
        } else if (typeof player2ReactionTime === 'number') {
            player2TimeEl.className = 'result-item winner';
            player1TimeEl.className = 'result-item';
            outcomeEl.textContent = `🎉 Player 2 wins by default!`;
            outcomeEl.className = 'result-item winner';
        } else {
            player1TimeEl.className = 'result-item';
            player2TimeEl.className = 'result-item';
            outcomeEl.textContent = `No one reacted!`;
            outcomeEl.className = 'result-item';
        }
    }
    
    resultsEl.style.display = 'block';
    startBtn.style.display = 'inline-block';
    startBtn.textContent = 'Play Again';
    backMenuBtn.style.display = 'inline-block';

    // Patch endGame to handle tournament scoring
    if (tournamentActive && gameMode === 'tournament') {
        let roundWinner = null;
        if (tooEarly && earlyPlayer) {
            // The other player wins if someone shoots too early
            roundWinner = earlyPlayer === 1 ? 2 : 1;
        } else {
            // Fastest valid reaction wins
            if (
                typeof player1ReactionTime === 'number' &&
                typeof player2ReactionTime === 'number'
            ) {
                if (player1ReactionTime < player2ReactionTime) {
                    roundWinner = 1;
                } else if (player2ReactionTime < player1ReactionTime) {
                    roundWinner = 2;
                }
            } else if (typeof player1ReactionTime === 'number') {
                roundWinner = 1;
            } else if (typeof player2ReactionTime === 'number') {
                roundWinner = 2;
            }
        }
        if (roundWinner) {
            tournamentWins[roundWinner]++;
            tournamentGamesPlayed++;
            updateTournamentScore();
            // Check for majority
            const needed = Math.ceil(tournamentBestOf / 2);
            if (tournamentWins[roundWinner] >= needed) {
                setTimeout(() => {
                    const winnerClass = roundWinner === 1 ? 'tournament-player1' : 'tournament-player2';
                    tournamentScore.innerHTML += `<br><span class='tournament-winner ${winnerClass}'>Player ${roundWinner} wins the tournament!</span>`;
                    startBtn.style.display = 'none';
                    backMenuBtn.style.display = 'inline-block';
                }, 500);
            } else if (tournamentGamesPlayed < tournamentBestOf) {
                setTimeout(() => {
                    startBtn.style.display = 'inline-block';
                    statusEl.textContent = 'Press Start for Next Round';
                }, 800);
            }
        }
    }
}

// Event listeners
startBtn.addEventListener('click', startGame);
backMenuBtn.addEventListener('click', showMenu);

document.addEventListener('keydown', (e) => {
    if (gameContainer.style.display !== 'block') return;
    if (gameMode === 'practice') {
        if (gameState === 'ready' || gameState === 'set') {
            if (e.code === 'KeyA' || e.code === 'Space') {
                endGame(true, 1);
            }
        } else if (gameState === 'go') {
            if (!player1ReactionTime && (e.code === 'KeyA' || e.code === 'Space')) {
                player1ReactionTime = Date.now() - startTime;
                endGame(false);
            }
        }
    } else if (gameMode === 'versus' || gameMode === 'tournament') {
        if (gameState === 'ready' || gameState === 'set') {
            if (e.code === 'KeyA') {
                endGame(true, 1);
            } else if (e.code === 'KeyL') {
                endGame(true, 2);
            }
        } else if (gameState === 'go') {
            let bothPressed = false;
            if (!player1ReactionTime && e.code === 'KeyA') {
                player1ReactionTime = Date.now() - startTime;
            }
            if (!player2ReactionTime && e.code === 'KeyL') {
                player2ReactionTime = Date.now() - startTime;
            }
            // End game if both have pressed, or if one pressed and the other hasn't after a short delay
            if (player1ReactionTime && player2ReactionTime) {
                endGame(false);
            } else if (player1ReactionTime || player2ReactionTime) {
                if (!gameTimeout) {
                    gameTimeout = setTimeout(() => {
                        endGame(false);
                    }, 2000);
                }
            }
        }
    }
});

// Reset if player doesn't react within 3 seconds of "GO!"
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState === 'go') {
        clearTimeout(gameTimeout);
    }
});