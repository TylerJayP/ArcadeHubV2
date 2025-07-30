// Simple Game Loader - Loads games from games/ directory
class GameLoader {
    constructor() {
        this.gameAvailability = new Map();
        this.checkAllGames();
    }

    async checkAllGames() {
        const games = window.gameRegistry.getAllGames();
        
        for (const game of games) {
            const isAvailable = await window.gameRegistry.checkGameAvailability(game.id);
            this.gameAvailability.set(game.id, isAvailable);
        }
        
        // Refresh the display after checking availability
        if (window.arcadeHub) {
            window.arcadeHub.refreshGameLibrary();
        }
    }

    isGameAvailable(gameId) {
        return this.gameAvailability.get(gameId) || false;
    }

    getGameUrl(gameId) {
        if (!this.isGameAvailable(gameId)) {
            return null;
        }
        
        return window.gameRegistry.getGamePath(gameId);
    }

    showGameStatus() {
        console.log('Game Availability Status:');
        for (const [gameId, available] of this.gameAvailability) {
            const game = window.gameRegistry.getGame(gameId);
            console.log(`${game.name}: ${available ? '✅ Available' : '❌ Missing'} (${window.gameRegistry.getGamePath(gameId)})`);
        }
    }
}

// Create global instance
window.gameLoader = new GameLoader();
