// Leaderboard Management System
class LeaderboardManager {
    constructor() {
        this.storageKey = 'arcadehub_leaderboards';
        this.leaderboards = this.loadLeaderboards();
        this.maxEntries = 10;
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
        this.updateLeaderboardDisplay(gameId);
        
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

    updateLeaderboardDisplay(activeGameId = null) {
        const content = document.getElementById('leaderboard-content');
        const tabs = document.querySelectorAll('.tab-btn');
        
        if (!content) return;

        // Determine which game to show
        let gameToShow = activeGameId;
        if (!gameToShow) {
            const activeTab = document.querySelector('.tab-btn.active');
            gameToShow = activeTab ? activeTab.dataset.game : 'rock-and-roll';
        }

        // Update active tab
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.game === gameToShow);
        });

        const game = window.gameRegistry.getGame(gameToShow);
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
            this.updateLeaderboardDisplay(gameId);
        }
    }

    exportLeaderboards() {
        return JSON.stringify(this.leaderboards, null, 2);
    }

    importLeaderboards(jsonData) {
        try {
            this.leaderboards = JSON.parse(jsonData);
            this.saveLeaderboards();
            this.updateLeaderboardDisplay();
            return true;
        } catch (e) {
            console.error('Error importing leaderboards:', e);
            return false;
        }
    }
}

// Create global instance
window.leaderboardManager = new LeaderboardManager();
