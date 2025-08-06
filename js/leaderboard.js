// Enhanced Leaderboard Manager with Collapsible Functionality
class LeaderboardManager {
    constructor() {
        this.storageKey = 'arcadehub_leaderboards';
        this.leaderboards = this.loadLeaderboards();
        this.maxEntries = 10;
        this.isExpanded = false; // Track collapse state
        this.currentActiveGame = 'rock-and-roll'; // Default active game
    }

    loadLeaderboards() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {
                'rock-and-roll': [],
                'quickshot': [],
                'zombie-shooter': [],
                'geo-dash': []
            };
        } catch (e) {
            console.error('Error loading leaderboards:', e);
            return {
                'rock-and-roll': [],
                'quickshot': [],
                'zombie-shooter': [],
                'geo-dash': []
            };
        }
    }

    saveLeaderboards() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.leaderboards));
        } catch (e) {
            console.error('Error saving leaderboards:', e);
        }
    }

    addScore(gameId, playerName, score, scoreType = 'points') {
        if (!this.leaderboards[gameId]) {
            this.leaderboards[gameId] = [];
        }

        const entry = {
            player: playerName,
            score: score,
            date: new Date().toISOString(),
            scoreType: scoreType
        };

        this.leaderboards[gameId].push(entry);
        
        // Sort based on score type
        if (scoreType === 'time') {
            // For time-based games, lower is better
            this.leaderboards[gameId].sort((a, b) => a.score - b.score);
        } else {
            // For points/waves, higher is better
            this.leaderboards[gameId].sort((a, b) => b.score - a.score);
        }

        // Keep only top entries
        this.leaderboards[gameId] = this.leaderboards[gameId].slice(0, this.maxEntries);
        
        this.saveLeaderboards();
        
        // Only update display if expanded
        if (this.isExpanded) {
            this.updateLeaderboardDisplay(gameId);
        }
        
        return this.getPlayerRank(gameId, playerName, score);
    }

    getPlayerRank(gameId, playerName, score) {
        const leaderboard = this.leaderboards[gameId] || [];
        return leaderboard.findIndex(entry => 
            entry.player === playerName && entry.score === score
        ) + 1;
    }

    getLeaderboard(gameId) {
        return this.leaderboards[gameId] || [];
    }

    // Initialize the collapsible leaderboard system
    initializeCollapsibleLeaderboard() {
        const panel = document.getElementById('leaderboard-panel');
        if (!panel) return;

        // Start in collapsed state
        panel.classList.add('collapsed');
        this.isExpanded = false;

        // Update the HTML structure to support collapsible functionality
        this.updateLeaderboardHTML();
        this.setupEventListeners();
        this.updateLeaderboardDisplay();
    }

    updateLeaderboardHTML() {
        const panel = document.getElementById('leaderboard-panel');
        if (!panel) return;

        // Wrap the title in a clickable header with collapse indicator
        const existingTitle = panel.querySelector('h3');
        if (existingTitle && !existingTitle.closest('.leaderboard-header')) {
            const header = document.createElement('div');
            header.className = 'leaderboard-header';
            header.innerHTML = `
                <h3>🏆 LEADERBOARDS 🏆</h3>
                <span class="collapse-indicator">▼</span>
            `;
            
            // Replace existing title with new header
            existingTitle.replaceWith(header);
        }
    }

    setupEventListeners() {
        const header = document.querySelector('.leaderboard-header');
        const tabs = document.querySelectorAll('.tab-btn');
        
        // Header click to toggle expand/collapse
        if (header) {
            header.addEventListener('click', () => {
                this.toggleLeaderboard();
            });
        }

        // Tab clicks
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent header toggle when clicking tabs
                const gameId = tab.dataset.game;
                this.handleTabClick(gameId);
            });
        });
    }

    handleTabClick(gameId) {
        if (!this.isExpanded) {
            // If collapsed, expand and show the clicked game
            this.expandLeaderboard();
            this.currentActiveGame = gameId;
            this.updateLeaderboardDisplay(gameId);
        } else {
            // If expanded, just switch games
            this.updateLeaderboardDisplay(gameId);
        }
    }

    toggleLeaderboard() {
        if (this.isExpanded) {
            this.collapseLeaderboard();
        } else {
            this.expandLeaderboard();
        }
    }

    expandLeaderboard() {
        const panel = document.getElementById('leaderboard-panel');
        if (!panel) return;

        panel.classList.remove('collapsed');
        panel.classList.add('expanded');
        this.isExpanded = true;

        // Show the content for the currently active game
        this.updateLeaderboardDisplay(this.currentActiveGame);

        // Add expanded class to trigger animations
        setTimeout(() => {
            const entries = panel.querySelectorAll('.leaderboard-entry');
            entries.forEach((entry, index) => {
                entry.style.animationDelay = `${(index + 1) * 0.1}s`;
                entry.style.animation = 'none';
                // Force reflow
                entry.offsetHeight;
                entry.style.animation = 'entrySlideIn 0.6s ease-out forwards';
            });
        }, 100);
    }

    collapseLeaderboard() {
        const panel = document.getElementById('leaderboard-panel');
        if (!panel) return;

        panel.classList.remove('expanded');
        panel.classList.add('collapsed');
        this.isExpanded = false;
    }

    updateLeaderboardDisplay(activeGameId = null) {
        const content = document.getElementById('leaderboard-content');
        const tabs = document.querySelectorAll('.tab-btn');
        
        if (!content) return;

        // Determine which game to show
        let gameToShow = activeGameId || this.currentActiveGame;
        this.currentActiveGame = gameToShow;

        // Update active tab
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.game === gameToShow);
        });

        // If collapsed, don't show content
        if (!this.isExpanded) {
            content.innerHTML = '';
            return;
        }

        const game = window.gameRegistry?.getGame(gameToShow);
        const leaderboard = this.getLeaderboard(gameToShow);

        content.innerHTML = `
            <h4>${game ? game.name : 'Game'} Leaderboard</h4>
            ${leaderboard.length === 0 ? 
                '<p style="text-align: center; color: #666; margin-top: 20px;">No scores yet!<br>Be the first to play!</p>' :
                leaderboard.map((entry, index) => `
                    <div class="leaderboard-entry">
                        <span class="rank">#${index + 1}</span>
                        <span class="player-name-lb">${this.truncateName(entry.player)}</span>
                        <span class="score">${this.formatScore(entry.score, entry.scoreType)}</span>
                    </div>
                `).join('')
            }
        `;

        // Trigger staggered animations for new entries
        setTimeout(() => {
            const entries = content.querySelectorAll('.leaderboard-entry');
            entries.forEach((entry, index) => {
                entry.style.opacity = '0';
                entry.style.transform = 'translateX(-50px)';
                entry.style.animation = `entrySlideIn 0.6s ease-out ${(index * 0.1)}s forwards`;
            });
        }, 50);
    }

    formatScore(score, scoreType) {
        switch (scoreType) {
            case 'time':
                return `${score}ms`;
            case 'waves':
                return `Wave ${score}`;
            case 'points':
            default:
                return score.toLocaleString();
        }
    }

    truncateName(name) {
        return name.length > 12 ? name.substring(0, 10) + '...' : name;
    }

    clearLeaderboard(gameId) {
        if (this.leaderboards[gameId]) {
            this.leaderboards[gameId] = [];
            this.saveLeaderboards();
            if (this.isExpanded) {
                this.updateLeaderboardDisplay(gameId);
            }
        }
    }

    exportLeaderboards() {
        return JSON.stringify(this.leaderboards, null, 2);
    }

    importLeaderboards(jsonData) {
        try {
            this.leaderboards = JSON.parse(jsonData);
            this.saveLeaderboards();
            if (this.isExpanded) {
                this.updateLeaderboardDisplay();
            }
            return true;
        } catch (e) {
            console.error('Error importing leaderboards:', e);
            return false;
        }
    }

    // Method to expand and show specific game (useful for external calls)
    showGameLeaderboard(gameId) {
        this.currentActiveGame = gameId;
        if (!this.isExpanded) {
            this.expandLeaderboard();
        } else {
            this.updateLeaderboardDisplay(gameId);
        }
    }
}

// Create global instance
window.leaderboardManager = new LeaderboardManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.leaderboardManager) {
        window.leaderboardManager.initializeCollapsibleLeaderboard();
    }
});