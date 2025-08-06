// Main ArcadeHub Application
class ArcadeHub {
    constructor() {
        this.currentUser = '';
        this.tokens = 3;
        this.currentGame = null;
        this.gameIframe = null;
        
        this.init();
    }

// Updated init method - remove the old setupLeaderboardTabs call since it's handled automatically
init() {
    this.loadUserData();
    this.setupEventListeners();
    // Remove this line: this.setupLeaderboardTabs(); 
    // The new system handles it automatically
    
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

        // FIXED: Better fullscreen overlay logic
        this.setupFullscreenOverlay();
        
        // NEW: Setup game results popup event listeners
        this.setupGameResultsPopup();
    }

// Updated setupGameResultsPopup method to work with collapsible leaderboard
setupGameResultsPopup() {
    const playAgainBtn = document.getElementById('play-again-btn');
    const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
    const backToHubBtn = document.getElementById('back-to-hub-btn');
    
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            this.hideGameResultsPopup();
            // Reload the current game
            if (this.currentGame && this.gameIframe) {
                this.gameIframe.src = window.gameLoader.getGameUrl(this.currentGame.id);
            }
        });
    }
    
    if (viewLeaderboardBtn) {
        viewLeaderboardBtn.addEventListener('click', () => {
            this.hideGameResultsPopup();
            this.backToLibrary();
            // Expand leaderboard and switch to current game's tab
            setTimeout(() => {
                const leaderboard = document.getElementById('leaderboard-panel');
                if (leaderboard && window.leaderboardManager) {
                    leaderboard.scrollIntoView({ behavior: 'smooth' });
                    // Use the new showGameLeaderboard method
                    window.leaderboardManager.showGameLeaderboard(this.currentGame?.id);
                }
            }, 300);
        });
    }
    
    if (backToHubBtn) {
        backToHubBtn.addEventListener('click', () => {
            this.hideGameResultsPopup();
            this.backToLibrary();
        });
    }
}

    setupFullscreenOverlay() {
        let hideTimeout;
        let isMouseOverGame = false;
        let isMouseOverOverlay = false;
        
        // Track mouse position globally
        document.addEventListener('mousemove', (e) => {
            const overlay = document.getElementById('fullscreen-overlay');
            const hint = document.getElementById('fullscreen-hint');
            const gameContainer = document.getElementById('game-container');
            const gameIframe = document.getElementById('game-iframe');
            
            if (gameContainer && gameContainer.classList.contains('fullscreen')) {
                // Check if mouse is over the game iframe
                if (gameIframe) {
                    const iframeRect = gameIframe.getBoundingClientRect();
                    isMouseOverGame = e.clientX >= iframeRect.left && 
                                     e.clientX <= iframeRect.right && 
                                     e.clientY >= iframeRect.top && 
                                     e.clientY <= iframeRect.bottom;
                }
                
                // Check if mouse is over the overlay
                if (overlay) {
                    const overlayRect = overlay.getBoundingClientRect();
                    isMouseOverOverlay = e.clientX >= overlayRect.left && 
                                        e.clientX <= overlayRect.right && 
                                        e.clientY >= overlayRect.top && 
                                        e.clientY <= overlayRect.bottom;
                }
                
                // Show overlay when mouse is NOT over the game OR when over the overlay
                const shouldShowOverlay = !isMouseOverGame || isMouseOverOverlay;
                
                // Show hint when mouse is near bottom-right
                const showHint = e.clientX > window.innerWidth - 400 && 
                               e.clientY > window.innerHeight - 150;
                
                // Clear any pending hide timeout
                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                    hideTimeout = null;
                }
                
                if (overlay) {
                    if (shouldShowOverlay) {
                        overlay.classList.add('visible');
                    } else {
                        // Add delay before hiding - only hide if mouse is over game AND not over overlay
                        if (isMouseOverGame && !isMouseOverOverlay) {
                            hideTimeout = setTimeout(() => {
                                overlay.classList.remove('visible');
                            }, 1500); // 1.5 second delay
                        }
                    }
                }
                
                if (hint) {
                    if (showHint && !isMouseOverGame) {
                        hint.classList.add('visible');
                    } else {
                        hint.classList.remove('visible');
                    }
                }
            }
        });

        // Show overlay when mouse leaves the window entirely in fullscreen
        document.addEventListener('mouseleave', () => {
            const overlay = document.getElementById('fullscreen-overlay');
            const gameContainer = document.getElementById('game-container');
            
            if (gameContainer && gameContainer.classList.contains('fullscreen') && overlay) {
                overlay.classList.add('visible');
            }
        });
        
        // Keep overlay visible when hovering over it
        const overlay = document.getElementById('fullscreen-overlay');
        if (overlay) {
            overlay.addEventListener('mouseenter', () => {
                isMouseOverOverlay = true;
                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                    hideTimeout = null;
                }
                overlay.classList.add('visible');
            });
            
            overlay.addEventListener('mouseleave', () => {
                isMouseOverOverlay = false;
                // Only hide if we're also over the game
                if (isMouseOverGame) {
                    hideTimeout = setTimeout(() => {
                        overlay.classList.remove('visible');
                    }, 500); // Shorter delay when leaving overlay
                }
            });
        }
    }

// Updated setupLeaderboardTabs method for main.js
setupLeaderboardTabs() {
    // The new leaderboard manager handles its own event listeners
    // Just make sure it's initialized
    if (window.leaderboardManager && window.leaderboardManager.initializeCollapsibleLeaderboard) {
        // This will be called automatically via DOMContentLoaded, but ensure it's ready
        setTimeout(() => {
            if (!window.leaderboardManager.isInitialized) {
                window.leaderboardManager.initializeCollapsibleLeaderboard();
            }
        }, 100);
    }
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

    // Add this method to your ArcadeHub class to manually expand leaderboard for a specific game
showLeaderboard(gameId) {
    if (window.leaderboardManager) {
        const leaderboardPanel = document.getElementById('leaderboard-panel');
        if (leaderboardPanel) {
            leaderboardPanel.scrollIntoView({ behavior: 'smooth' });
            window.leaderboardManager.showGameLeaderboard(gameId);
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

        const allGames = window.gameRegistry.getAllGames();
        
        // Filter to only show available games
        const availableGames = allGames.filter(game => 
            window.gameLoader.isGameAvailable(game.id)
        );
        
        if (availableGames.length === 0) {
            library.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666; text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🎮</div>
                    <div style="font-size: 1.5rem; margin-bottom: 15px;">No Games Available</div>
                    <div style="font-size: 1rem; max-width: 400px; line-height: 1.5;">
                        Add your game folders to the <strong>games/</strong> directory to see them here:
                        <br><br>
                        • <strong>games/RockandRoll/</strong><br>
                        • <strong>games/QuickShot/</strong><br>
                        • <strong>games/ZombieShooter/</strong>
                    </div>
                </div>
            `;
            return;
        }

        library.innerHTML = `
            <div class="game-grid">
                ${availableGames.map(game => this.createGameCard(game)).join('')}
            </div>
        `;

        // Add click listeners to available game cards only
        availableGames.forEach(game => {
            const card = document.getElementById(`game-${game.id}`);
            if (card) {
                card.addEventListener('click', () => this.selectGame(game));
            }
        });
    }

    createGameCard(game) {
        const hasTokens = this.tokens > 0;
        
        return `
            <div class="game-card ${!hasTokens ? 'disabled' : ''}" id="game-${game.id}">
                <div class="game-preview">${game.preview}</div>
                <div class="game-name">${game.name}</div>
                <div class="game-description">${game.description}</div>
                <div class="game-info">
                    <span class="difficulty">★ ${game.difficulty}/5</span>
                    <span class="cost-indicator">
                        ${hasTokens ? '1 TOKEN' : 'NO TOKENS'}
                    </span>
                </div>
                <div style="font-size: 0.7rem; color: #888; margin-top: 8px;">
                    Controls: ${game.controls}
                </div>
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
            alert(`Game not available: ${game.name}`);
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
        // Score display removed from UI, but keeping this for potential future use
        console.log('Current score:', score);
    }

    // NEW: Show custom game results popup
    showGameResultsPopup(gameData) {
        const modal = document.getElementById('game-results-modal');
        const gameNameEl = document.getElementById('game-name-result');
        const scoreValueEl = document.getElementById('final-score-value');
        const rankIconEl = document.getElementById('rank-icon');
        const rankValueEl = document.getElementById('rank-value');
        const rankCommentEl = document.getElementById('rank-comment');
        const tokensSection = document.getElementById('tokens-section');
        const tokensValueEl = document.getElementById('tokens-value');
        const rankSection = document.querySelector('.leaderboard-rank-section');
        
        // Update game name
        if (gameNameEl) gameNameEl.textContent = gameData.gameName;
        
        // Update final score
        if (scoreValueEl) scoreValueEl.textContent = gameData.formattedScore;
        
        // Update rank information
        if (gameData.rank > 0) {
            if (rankValueEl) rankValueEl.textContent = `#${gameData.rank}`;
            
            // Set rank-specific styling and content
            rankSection.className = 'leaderboard-rank-section';
            
            if (gameData.rank === 1) {
                rankSection.classList.add('rank-1');
                if (rankIconEl) rankIconEl.textContent = '👑';
                if (rankCommentEl) rankCommentEl.textContent = 'New Champion!';
            } else if (gameData.rank === 2) {
                rankSection.classList.add('rank-2');
                if (rankIconEl) rankIconEl.textContent = '🥈';
                if (rankCommentEl) rankCommentEl.textContent = 'Silver Medal!';
            } else if (gameData.rank === 3) {
                rankSection.classList.add('rank-3');
                if (rankIconEl) rankIconEl.textContent = '🥉';
                if (rankCommentEl) rankCommentEl.textContent = 'Bronze Medal!';
            } else if (gameData.rank <= 5) {
                rankSection.classList.add('rank-other');
                if (rankIconEl) rankIconEl.textContent = '🎖️';
                if (rankCommentEl) rankCommentEl.textContent = 'Top 5 Finish!';
            } else {
                rankSection.classList.add('rank-other');
                if (rankIconEl) rankIconEl.textContent = '📊';
                if (rankCommentEl) rankCommentEl.textContent = `Out of ${window.leaderboardManager.getLeaderboard(gameData.gameId).length} players`;
            }
        } else {
            // No rank (not on leaderboard)
            if (rankValueEl) rankValueEl.textContent = 'Unranked';
            if (rankIconEl) rankIconEl.textContent = '🎮';
            if (rankCommentEl) rankCommentEl.textContent = 'Keep trying!';
            rankSection.className = 'leaderboard-rank-section rank-other';
        }
        
        // Show/hide tokens section
        if (gameData.tokensEarned > 0) {
            tokensSection.classList.remove('hidden');
            if (tokensValueEl) tokensValueEl.textContent = `+${gameData.tokensEarned}`;
        } else {
            tokensSection.classList.add('hidden');
        }
        
        // Show the modal
        if (modal) {
            modal.classList.add('show');
        }
    }

    // NEW: Hide custom game results popup
    hideGameResultsPopup() {
        const modal = document.getElementById('game-results-modal');
        if (modal) {
            modal.classList.remove('show');
        }
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
        
        // Show custom results popup instead of alert
        setTimeout(() => {
            this.showGameResultsPopup({
                gameName: game.name,
                gameId: gameId || game.id,
                finalScore: finalScore,
                formattedScore: window.leaderboardManager.formatScore(finalScore, scoreType),
                rank: rank,
                tokensEarned: tokensEarned,
                scoreType: scoreType
            });
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