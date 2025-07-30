// Main ArcadeHub Application
class ArcadeHub {
    constructor() {
        this.currentUser = '';
        this.tokens = 3;
        this.currentGame = null;
        this.gameIframe = null;
        
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.setupLeaderboardTabs();
        
        if (!this.currentUser) {
            this.showLoginModal();
        } else {
            this.hideLoginModal();
            this.updateDisplay();
            this.renderGameLibrary();
        }
    }

    loadUserData() {
        this.currentUser = localStorage.getItem('arcadehub_username') || '';
        this.tokens = parseInt(localStorage.getItem('arcadehub_tokens')) || 3;
        
        // Give daily token
        const lastLogin = localStorage.getItem('arcadehub_last_login');
        const today = new Date().toDateString();
        
        if (lastLogin !== today && this.currentUser) {
            this.tokens = Math.min(this.tokens + 1, 10); // Max 10 tokens
            localStorage.setItem('arcadehub_last_login', today);
            this.saveUserData();
        }
    }

    saveUserData() {
        localStorage.setItem('arcadehub_username', this.currentUser);
        localStorage.setItem('arcadehub_tokens', this.tokens.toString());
    }

    setupEventListeners() {
        // Login
        const loginBtn = document.getElementById('login-btn');
        const usernameInput = document.getElementById('username-input');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }
        
        if (usernameInput) {
            usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
        }

        // Player dropdown
        const playerNameBtn = document.getElementById('player-name-btn');
        const dropdownMenu = document.getElementById('dropdown-menu');
        const changePlayerBtn = document.getElementById('change-player-btn');
        const logoutBtn = document.getElementById('logout-btn');

        if (playerNameBtn) {
            playerNameBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }

        if (changePlayerBtn) {
            changePlayerBtn.addEventListener('click', () => {
                this.changePlayer();
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.closeDropdown();
        });

        // Prevent dropdown from closing when clicking inside it
        if (dropdownMenu) {
            dropdownMenu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Back button
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.backToLibrary());
        }

        // Fullscreen back button
        const fullscreenBackBtn = document.getElementById('fullscreen-back-btn');
        if (fullscreenBackBtn) {
            fullscreenBackBtn.addEventListener('click', () => this.backToLibrary());
        }

        // Zoom button
        const zoomBtn = document.getElementById('zoom-btn');
        if (zoomBtn) {
            zoomBtn.addEventListener('click', () => this.toggleZoom());
        }

        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Listen for score messages from games
        window.addEventListener('message', (event) => {
            this.handleGameMessage(event);
        });

        // ESC key to exit fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.exitFullscreen();
            }
        });

        // Show/hide fullscreen controls on mouse movement
        let fullscreenTimeout;
        document.addEventListener('mousemove', (e) => {
            const overlay = document.getElementById('fullscreen-overlay');
            const hint = document.getElementById('fullscreen-hint');
            const gameContainer = document.getElementById('game-container');
            const gameHeader = document.getElementById('game-frame')?.querySelector('.game-header');
            
            if (gameContainer && gameContainer.classList.contains('fullscreen')) {
                // Check if mouse is over the regular game header (avoid double buttons)
                let isOverHeader = false;
                if (gameHeader) {
                    const headerRect = gameHeader.getBoundingClientRect();
                    isOverHeader = e.clientX >= headerRect.left && 
                                  e.clientX <= headerRect.right && 
                                  e.clientY >= headerRect.top && 
                                  e.clientY <= headerRect.bottom;
                }
                
                // Only show floating controls when NOT over the regular header
                // and when mouse is in far top-left corner
                const showControls = !isOverHeader && e.clientX < 120 && e.clientY < 80;
                
                // Show hint when mouse is near bottom-right
                const showHint = e.clientX > window.innerWidth - 400 && e.clientY > window.innerHeight - 150;
                
                if (overlay) overlay.classList.toggle('visible', showControls);
                if (hint) hint.classList.toggle('visible', showHint);
                
                // Auto-hide after 4 seconds of no movement
                clearTimeout(fullscreenTimeout);
                fullscreenTimeout = setTimeout(() => {
                    if (overlay) overlay.classList.remove('visible');
                    if (hint) hint.classList.remove('visible');
                }, 4000);
            }
        });
    }

    setupLeaderboardTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                window.leaderboardManager.updateLeaderboardDisplay(tab.dataset.game);
            });
        });
        
        // Initialize leaderboard display
        window.leaderboardManager.updateLeaderboardDisplay();
    }

    toggleDropdown() {
        const dropdownMenu = document.getElementById('dropdown-menu');
        if (dropdownMenu) {
            dropdownMenu.classList.toggle('show');
        }
    }

    closeDropdown() {
        const dropdownMenu = document.getElementById('dropdown-menu');
        if (dropdownMenu) {
            dropdownMenu.classList.remove('show');
        }
    }

    changePlayer() {
        this.closeDropdown();
        this.showLoginModal();
    }

    logout() {
        this.closeDropdown();
        
        // Clear user data
        this.currentUser = '';
        this.tokens = 3;
        localStorage.removeItem('arcadehub_username');
        localStorage.removeItem('arcadehub_tokens');
        localStorage.removeItem('arcadehub_last_login');
        
        // Show login modal
        this.showLoginModal();
    }

    handleLogin() {
        const usernameInput = document.getElementById('username-input');
        const username = usernameInput.value.trim();
        
        if (username.length < 1) {
            alert('Please enter a valid username');
            return;
        }
        
        this.currentUser = username;
        localStorage.setItem('arcadehub_last_login', new Date().toDateString());
        this.saveUserData();
        this.hideLoginModal();
        this.updateDisplay();
        this.renderGameLibrary();
    }

    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.style.display = 'flex';
            const input = document.getElementById('username-input');
            if (input) {
                input.value = '';
                input.focus();
            }
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateDisplay() {
        const usernameEl = document.getElementById('username');
        const currentPlayerEl = document.getElementById('current-player-name');
        const tokenEl = document.getElementById('token-display');
        
        if (usernameEl) usernameEl.textContent = this.currentUser;
        if (currentPlayerEl) currentPlayerEl.textContent = this.currentUser;
        if (tokenEl) tokenEl.textContent = this.tokens;
    }

    renderGameLibrary() {
        const library = document.getElementById('game-library');
        if (!library) return;

        const games = window.gameRegistry.getAllGames();
        
        library.innerHTML = `
            <div class="game-grid">
                ${games.map(game => this.createGameCard(game)).join('')}
            </div>
        `;

        // Add click listeners to game cards
        games.forEach(game => {
            const card = document.getElementById(`game-${game.id}`);
            if (card) {
                card.addEventListener('click', () => this.selectGame(game));
            }
        });
    }

    createGameCard(game) {
        const hasTokens = this.tokens > 0;
        const isAvailable = window.gameLoader.isGameAvailable(game.id);
        
        return `
            <div class="game-card ${!hasTokens || !isAvailable ? 'disabled' : ''}" id="game-${game.id}">
                <div class="game-preview">${game.preview}</div>
                <div class="game-name">${game.name}</div>
                <div class="game-description">${game.description}</div>
                <div class="game-info">
                    <span class="difficulty">★ ${game.difficulty}/5</span>
                    <span class="cost-indicator">
                        ${!isAvailable ? '📁 MISSING' : hasTokens ? '1 TOKEN' : 'NO TOKENS'}
                    </span>
                </div>
                <div style="font-size: 0.7rem; color: #888; margin-top: 8px;">
                    Controls: ${game.controls}
                </div>
                ${!isAvailable ? `<div style="font-size: 0.6rem; color: #ff6666; margin-top: 5px;">Add games/${game.folder}/ folder</div>` : ''}
            </div>
        `;
    }

    selectGame(game) {
        if (this.tokens <= 0) {
            alert('You need tokens to play! Come back tomorrow for a free token.');
            return;
        }

        const gameUrl = window.gameLoader.getGameUrl(game.id);
        if (!gameUrl) {
            alert(`Please add the ${game.folder} folder to the games/ directory to play this game.`);
            return;
        }

        // Spend token
        this.tokens--;
        this.saveUserData();
        this.updateDisplay();

        // Load game
        this.loadGame(game, gameUrl);
    }

    loadGame(game, gameUrl) {
        this.currentGame = game;
        
        // Hide library and show game frame
        const library = document.getElementById('game-library');
        const gameFrame = document.getElementById('game-frame');
        const gameTitle = document.getElementById('current-game-title');
        const gameIframe = document.getElementById('game-iframe');
        
        if (library) library.style.display = 'none';
        if (gameFrame) gameFrame.style.display = 'block';
        if (gameTitle) gameTitle.textContent = game.name;
        
        if (gameIframe) {
            this.gameIframe = gameIframe;
            gameIframe.src = gameUrl;
            
            // Set up score monitoring
            this.resetLiveScore();
        }
    }

    toggleZoom() {
        const gameContainer = document.getElementById('game-container');
        const zoomBtn = document.getElementById('zoom-btn');
        
        if (gameContainer && zoomBtn) {
            if (gameContainer.classList.contains('zoomed')) {
                gameContainer.classList.remove('zoomed');
                zoomBtn.textContent = '🔍 ZOOM';
            } else {
                gameContainer.classList.add('zoomed');
                zoomBtn.textContent = '🔍 NORMAL';
            }
        }
    }

    toggleFullscreen() {
        const gameContainer = document.getElementById('game-container');
        
        if (gameContainer) {
            if (gameContainer.classList.contains('fullscreen')) {
                this.exitFullscreen();
            } else {
                this.enterFullscreen();
            }
        }
    }

    enterFullscreen() {
        const gameContainer = document.getElementById('game-container');
        const gameFrame = document.getElementById('game-frame');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        
        if (gameContainer && fullscreenBtn) {
            gameContainer.classList.add('fullscreen');
            if (gameFrame) gameFrame.classList.add('fullscreen-active');
            fullscreenBtn.textContent = '⛶ NORMAL';
        }
    }

    exitFullscreen() {
        const gameContainer = document.getElementById('game-container');
        const gameFrame = document.getElementById('game-frame');
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        const overlay = document.getElementById('fullscreen-overlay');
        const hint = document.getElementById('fullscreen-hint');
        
        if (gameContainer && fullscreenBtn) {
            gameContainer.classList.remove('fullscreen');
            if (gameFrame) gameFrame.classList.remove('fullscreen-active');
            fullscreenBtn.textContent = '⛶ EXPAND';
            
            // Hide overlay controls
            if (overlay) overlay.classList.remove('visible');
            if (hint) hint.classList.remove('visible');
        }
    }

    backToLibrary() {
        // Exit fullscreen when going back
        this.exitFullscreen();
        
        // Reset zoom
        const gameContainer = document.getElementById('game-container');
        const zoomBtn = document.getElementById('zoom-btn');
        if (gameContainer) gameContainer.classList.remove('zoomed');
        if (zoomBtn) zoomBtn.textContent = '🔍 ZOOM';
        
        // Clean up current game
        if (this.gameIframe) {
            this.gameIframe.src = '';
            this.gameIframe = null;
        }
        
        this.currentGame = null;
        
        // Show library and hide game frame
        const library = document.getElementById('game-library');
        const gameFrame = document.getElementById('game-frame');
        
        if (library) library.style.display = 'block';
        if (gameFrame) gameFrame.style.display = 'none';
        
        this.renderGameLibrary();
    }

    handleGameMessage(event) {
        // Handle messages from game iframes
        if (event.data && typeof event.data === 'object') {
            const { type, score, gameId } = event.data;
            
            if (type === 'score_update') {
                this.updateLiveScore(score);
            } else if (type === 'game_end') {
                this.handleGameEnd(score, gameId || this.currentGame?.id);
            }
        }
    }

    updateLiveScore(score) {
        const scoreEl = document.getElementById('live-score');
        if (scoreEl) {
            scoreEl.textContent = score;
        }
    }

    resetLiveScore() {
        this.updateLiveScore(0);
    }

    handleGameEnd(finalScore, gameId) {
        if (!this.currentGame || !this.currentUser) return;
        
        const game = this.currentGame;
        const scoreType = game.scoreType || 'points';
        
        // Add to leaderboard
        const rank = window.leaderboardManager.addScore(
            gameId || game.id,
            this.currentUser,
            finalScore,
            scoreType
        );
        
        // Award tokens based on performance
        let tokensEarned = 0;
        if (rank <= 3) {
            tokensEarned = game.tokensOnWin;
        } else if (rank <= 5) {
            tokensEarned = Math.floor(game.tokensOnWin / 2);
        }
        
        if (tokensEarned > 0) {
            this.tokens = Math.min(this.tokens + tokensEarned, 10);
            this.saveUserData();
            this.updateDisplay();
        }
        
        // Show result
        setTimeout(() => {
            let message = `Game Over!\nFinal Score: ${window.leaderboardManager.formatScore(finalScore, scoreType)}`;
            if (rank > 0) {
                message += `\nLeaderboard Rank: #${rank}`;
            }
            if (tokensEarned > 0) {
                message += `\nTokens Earned: ${tokensEarned}`;
            }
            
            alert(message);
        }, 500);
    }

    refreshGameLibrary() {
        this.renderGameLibrary();
    }

    // Debug methods
    addTokens(amount = 5) {
        this.tokens = Math.min(this.tokens + amount, 10);
        this.saveUserData();
        this.updateDisplay();
    }

    resetTokens() {
        this.tokens = 3;
        this.saveUserData();
        this.updateDisplay();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.arcadeHub = new ArcadeHub();
});