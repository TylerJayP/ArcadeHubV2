// Game Registry - Manages available games
class GameRegistry {
    constructor() {
        this.games = new Map();
        this.loadDefaultGames();
    }

    loadDefaultGames() {
        // Rock and Roll
        this.addGame({
            id: 'rock-and-roll',
            name: 'ROCK AND ROLL',
            description: 'Rhythm-based driving game - hit the notes and avoid obstacles!',
            developer: 'Team Member',
            difficulty: 4,
            preview: '🎸',
            folder: 'RockandRoll',
            entryFile: 'index.html',
            tokensOnWin: 3,
            scoreType: 'points',
            controls: 'Arrow Keys + Number Keys 1-5'
        });

        // QuickShot
        this.addGame({
            id: 'quickshot',
            name: 'QUICK DRAW SHOWDOWN',
            description: 'Lightning-fast reflexes test - beat the computer!',
            developer: 'Team Member', 
            difficulty: 2,
            preview: '🤠',
            folder: 'QuickShot',
            entryFile: 'index.html',
            tokensOnWin: 2,
            scoreType: 'time',
            controls: 'Spacebar'
        });

        // Zombie Shooter
        this.addGame({
            id: 'zombie-shooter',
            name: 'ZOMBIE DEFENSE',
            description: 'Survive waves of zombies! Build defenses and fight back!',
            developer: 'Team Member',
            difficulty: 5,
            preview: '🧟',
            folder: 'ZombieShooter',
            entryFile: 'zombie_shooter_game.html',
            tokensOnWin: 4,
            scoreType: 'waves',
            controls: 'WASD + Mouse + E to cut trees'
        });
    }

    addGame(gameData) {
        this.games.set(gameData.id, gameData);
        console.log(`Added game: ${gameData.name}`);
    }

    getGame(id) {
        return this.games.get(id);
    }

    getAllGames() {
        return Array.from(this.games.values());
    }

    removeGame(id) {
        return this.games.delete(id);
    }

    getGamePath(gameId) {
        const game = this.getGame(gameId);
        if (!game) return null;
        return `games/${game.folder}/${game.entryFile}`;
    }

    async checkGameAvailability(gameId) {
        const gamePath = this.getGamePath(gameId);
        if (!gamePath) return false;
        
        try {
            const response = await fetch(gamePath, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.log(`Game ${gameId} not found at ${gamePath}`);
            return false;
        }
    }
}

// Create global instance
window.gameRegistry = new GameRegistry();
