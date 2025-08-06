class GeometryDash {
    constructor() {
        this.gameContainer = document.getElementById('gameContainer');
        this.player = document.getElementById('player');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('bestScore');
        this.gameOverScreen = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.levelInfo = document.getElementById('levelInfo');
        this.modeInfo = document.getElementById('modeInfo');
        this.levelCompleteScreen = document.getElementById('levelComplete');
        this.levelStats = document.getElementById('levelStats');
        
        this.gameWidth = 800;
        this.gameHeight = 400;
        this.groundHeight = 50;
        
        this.playerX = 100;
        this.playerY = this.gameHeight - this.groundHeight - 30;
        this.playerWidth = 30;
        this.playerHeight = 30;
        
        this.velocityY = 0;
        this.gravity = 0.6;
        this.jumpPower = -12;
        this.powerJumpPower = -16;
        this.isGrounded = true;
        this.isShiftHeld = false;
        this.gameSpeed = 3;
        
        this.obstacles = [];
        this.clouds = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('geometryDashBest') || 0;
        this.gameRunning = false;
        this.frameCount = 0;
        
        // Level system properties
        this.gameMode = null;
        this.currentLevel = 1;
        this.levelProgress = 0;
        this.levelLength = 0;
        this.levelObstacles = [];
        this.obstacleIndex = 0;
        this.unlockedLevels = JSON.parse(localStorage.getItem('unlockedLevels')) || [1];
        this.completedLevels = JSON.parse(localStorage.getItem('completedLevels')) || [];
        
        // Dev mode properties
        this.devMode = false;
        
        this.levels = this.createLevels();
        this.init();
    }
    
    createLevels() {
        return {
            1: {
                name: "First Steps",
                length: 2000,
                obstacles: [
                    {x: 300, type: 'spike'},
                    {x: 450, type: 'spike'},
                    {x: 600, type: 'platform', width: 60, height: 40},
                    {x: 800, type: 'spike'},
                    {x: 950, type: 'block'},
                    {x: 1100, type: 'spike'},
                    {x: 1300, type: 'platform', width: 50, height: 60},
                    {x: 1500, type: 'spike'},
                    {x: 1650, type: 'platform', width: 70, height: 30},
                    {x: 1850, type: 'spike'}
                ]
            },
            2: {
                name: "Block Runner",
                length: 2200,
                obstacles: [
                    {x: 250, type: 'block'},
                    {x: 400, type: 'platform', width: 50, height: 70},
                    {x: 550, type: 'spike'},
                    {x: 700, type: 'block'},
                    {x: 880, type: 'platform', width: 60, height: 40},
                    {x: 1050, type: 'spike'},
                    {x: 1200, type: 'block'},
                    {x: 1380, type: 'platform', width: 45, height: 80},
                    {x: 1550, type: 'spike'},
                    {x: 1720, type: 'block'},
                    {x: 1900, type: 'spike'},
                    {x: 2050, type: 'platform', width: 55, height: 35}
                ]
            },
            3: {
                name: "Platform Paradise",
                length: 2400,
                obstacles: [
                    {x: 200, type: 'platform', width: 50, height: 50},
                    {x: 350, type: 'spike'},
                    {x: 500, type: 'platform', width: 40, height: 70},
                    {x: 650, type: 'spike'},
                    {x: 800, type: 'platform', width: 55, height: 30},
                    {x: 950, type: 'block'},
                    {x: 1120, type: 'platform', width: 45, height: 60},
                    {x: 1280, type: 'spike'},
                    {x: 1450, type: 'platform', width: 60, height: 40},
                    {x: 1620, type: 'spike'},
                    {x: 1780, type: 'platform', width: 40, height: 80},
                    {x: 1950, type: 'spike'},
                    {x: 2100, type: 'platform', width: 50, height: 25},
                    {x: 2280, type: 'spike'}
                ]
            },
            4: {
                name: "Mixed Mayhem",
                length: 2600,
                obstacles: [
                    {x: 180, type: 'spike'},
                    {x: 320, type: 'platform', width: 40, height: 45},
                    {x: 480, type: 'spike'},
                    {x: 620, type: 'block'},
                    {x: 780, type: 'spike'},
                    {x: 940, type: 'platform', width: 50, height: 70},
                    {x: 1100, type: 'spike'},
                    {x: 1260, type: 'block'},
                    {x: 1420, type: 'platform', width: 45, height: 30},
                    {x: 1580, type: 'spike'},
                    {x: 1740, type: 'block'},
                    {x: 1900, type: 'spike'},
                    {x: 2060, type: 'platform', width: 40, height: 60},
                    {x: 2220, type: 'spike'},
                    {x: 2380, type: 'platform', width: 55, height: 40},
                    {x: 2520, type: 'spike'}
                ]
            },
            5: {
                name: "The Gauntlet",
                length: 2800,
                obstacles: [
                    {x: 160, type: 'spike'},
                    {x: 300, type: 'platform', width: 40, height: 50},
                    {x: 460, type: 'spike'},
                    {x: 600, type: 'spike'},
                    {x: 760, type: 'block'},
                    {x: 920, type: 'platform', width: 45, height: 70},
                    {x: 1080, type: 'spike'},
                    {x: 1240, type: 'platform', width: 50, height: 30},
                    {x: 1400, type: 'spike'},
                    {x: 1560, type: 'block'},
                    {x: 1720, type: 'spike'},
                    {x: 1880, type: 'platform', width: 40, height: 60},
                    {x: 2040, type: 'spike'},
                    {x: 2200, type: 'block'},
                    {x: 2360, type: 'platform', width: 55, height: 40},
                    {x: 2520, type: 'spike'},
                    {x: 2680, type: 'spike'}
                ]
            },
            6: {
                name: "Speed Demon",
                length: 3000,
                obstacles: [
                    {x: 200, type: 'spike'},
                    {x: 320, type: 'spike'},
                    {x: 480, type: 'platform', width: 45, height: 40},
                    {x: 640, type: 'spike'},
                    {x: 780, type: 'spike'},
                    {x: 920, type: 'block'},
                    {x: 1080, type: 'platform', width: 50, height: 30},
                    {x: 1220, type: 'spike'},
                    {x: 1360, type: 'spike'},
                    {x: 1520, type: 'platform', width: 40, height: 50},
                    {x: 1680, type: 'spike'},
                    {x: 1820, type: 'block'},
                    {x: 1980, type: 'spike'},
                    {x: 2140, type: 'platform', width: 60, height: 35},
                    {x: 2300, type: 'spike'},
                    {x: 2460, type: 'spike'},
                    {x: 2620, type: 'block'},
                    {x: 2780, type: 'spike'},
                    {x: 2920, type: 'platform', width: 55, height: 45}
                ]
            },
            7: {
                name: "Sky Highway",
                length: 3200,
                obstacles: [
                    {x: 180, type: 'platform', width: 50, height: 60},
                    {x: 340, type: 'spike'},
                    {x: 500, type: 'platform', width: 45, height: 80},
                    {x: 660, type: 'platform', width: 40, height: 40},
                    {x: 820, type: 'spike'},
                    {x: 980, type: 'platform', width: 60, height: 50},
                    {x: 1160, type: 'spike'},
                    {x: 1320, type: 'platform', width: 35, height: 90},
                    {x: 1480, type: 'block'},
                    {x: 1640, type: 'platform', width: 55, height: 35},
                    {x: 1800, type: 'spike'},
                    {x: 1960, type: 'platform', width: 40, height: 70},
                    {x: 2140, type: 'platform', width: 50, height: 45},
                    {x: 2300, type: 'spike'},
                    {x: 2460, type: 'platform', width: 45, height: 55},
                    {x: 2620, type: 'spike'},
                    {x: 2780, type: 'platform', width: 60, height: 30},
                    {x: 2940, type: 'spike'},
                    {x: 3100, type: 'platform', width: 50, height: 65}
                ]
            },
            8: {
                name: "Obstacle Course",
                length: 3400,
                obstacles: [
                    {x: 160, type: 'spike'},
                    {x: 280, type: 'block'},
                    {x: 420, type: 'platform', width: 45, height: 50},
                    {x: 580, type: 'spike'},
                    {x: 720, type: 'platform', width: 40, height: 70},
                    {x: 880, type: 'spike'},
                    {x: 1020, type: 'block'},
                    {x: 1180, type: 'platform', width: 50, height: 40},
                    {x: 1340, type: 'spike'},
                    {x: 1480, type: 'platform', width: 35, height: 60},
                    {x: 1640, type: 'spike'},
                    {x: 1800, type: 'block'},
                    {x: 1960, type: 'spike'},
                    {x: 2120, type: 'platform', width: 60, height: 35},
                    {x: 2280, type: 'spike'},
                    {x: 2440, type: 'platform', width: 40, height: 80},
                    {x: 2600, type: 'block'},
                    {x: 2760, type: 'spike'},
                    {x: 2920, type: 'platform', width: 45, height: 45},
                    {x: 3080, type: 'spike'},
                    {x: 3240, type: 'platform', width: 55, height: 55}
                ]
            },
            9: {
                name: "Expert Challenge",
                length: 3600,
                obstacles: [
                    {x: 140, type: 'spike'},
                    {x: 260, type: 'platform', width: 40, height: 60},
                    {x: 400, type: 'spike'},
                    {x: 520, type: 'spike'},
                    {x: 660, type: 'block'},
                    {x: 800, type: 'platform', width: 35, height: 75},
                    {x: 940, type: 'spike'},
                    {x: 1080, type: 'platform', width: 45, height: 40},
                    {x: 1220, type: 'spike'},
                    {x: 1360, type: 'block'},
                    {x: 1500, type: 'platform', width: 50, height: 55},
                    {x: 1660, type: 'spike'},
                    {x: 1800, type: 'spike'},
                    {x: 1940, type: 'platform', width: 40, height: 70},
                    {x: 2100, type: 'spike'},
                    {x: 2240, type: 'block'},
                    {x: 2380, type: 'platform', width: 45, height: 35},
                    {x: 2540, type: 'spike'},
                    {x: 2680, type: 'platform', width: 60, height: 50},
                    {x: 2840, type: 'spike'},
                    {x: 2980, type: 'block'},
                    {x: 3140, type: 'spike'},
                    {x: 3280, type: 'platform', width: 50, height: 65},
                    {x: 3440, type: 'spike'}
                ]
            },
            10: {
                name: "Master's Trial",
                length: 4000,
                obstacles: [
                    {x: 120, type: 'spike'},
                    {x: 240, type: 'platform', width: 40, height: 50},
                    {x: 360, type: 'spike'},
                    {x: 480, type: 'block'},
                    {x: 620, type: 'platform', width: 45, height: 70},
                    {x: 760, type: 'spike'},
                    {x: 880, type: 'spike'},
                    {x: 1020, type: 'platform', width: 35, height: 80},
                    {x: 1160, type: 'spike'},
                    {x: 1300, type: 'block'},
                    {x: 1440, type: 'platform', width: 50, height: 40},
                    {x: 1600, type: 'spike'},
                    {x: 1740, type: 'platform', width: 40, height: 60},
                    {x: 1880, type: 'spike'},
                    {x: 2020, type: 'block'},
                    {x: 2160, type: 'spike'},
                    {x: 2300, type: 'platform', width: 55, height: 35},
                    {x: 2460, type: 'spike'},
                    {x: 2600, type: 'platform', width: 40, height: 75},
                    {x: 2760, type: 'spike'},
                    {x: 2900, type: 'block'},
                    {x: 3040, type: 'platform', width: 45, height: 45},
                    {x: 3200, type: 'spike'},
                    {x: 3340, type: 'spike'},
                    {x: 3480, type: 'platform', width: 60, height: 50},
                    {x: 3640, type: 'spike'},
                    {x: 3780, type: 'block'},
                    {x: 3920, type: 'spike'}
                ]
            }
        };
    }
    
    init() {
        this.bestScoreElement.textContent = this.bestScore;
        this.updatePlayerPosition();
        this.createClouds();
        this.bindEvents();
        this.createLevelGrid();
    }
    
    createLevelGrid() {
        const grid = document.getElementById('levelGrid');
        grid.innerHTML = '';
        
        for (let i = 1; i <= Object.keys(this.levels).length; i++) {
            const button = document.createElement('button');
            button.className = 'levelButton';
            button.textContent = i;
            
            const isUnlocked = this.devMode || this.unlockedLevels.includes(i);
            const isCompleted = this.completedLevels.includes(i);
            
            if (isCompleted) {
                button.classList.add('completed');
            } else if (isUnlocked) {
                button.classList.add('unlocked');
            }
            
            if (this.devMode && !this.unlockedLevels.includes(i)) {
                button.style.border = '2px solid #ff4444';
                button.title = 'DEV MODE: Unlocked for testing';
            }
            
            if (isUnlocked) {
                button.onclick = () => this.startLevel(i);
            } else {
                button.style.opacity = '0.3';
                button.style.cursor = 'not-allowed';
            }
            
            grid.appendChild(button);
        }
        
        if (this.devMode) {
            let devIndicator = document.getElementById('devModeIndicator');
            if (!devIndicator) {
                devIndicator = document.createElement('div');
                devIndicator.id = 'devModeIndicator';
                devIndicator.style.cssText = `
                    color: #ff4444;
                    font-weight: bold;
                    margin-top: 15px;
                    font-size: 14px;
                    text-align: center;
                `;
                devIndicator.innerHTML = '🛠️ DEV MODE: All levels unlocked for testing<br><small>Press Ctrl+D to toggle</small>';
                document.getElementById('levelSelector').appendChild(devIndicator);
            }
        } else {
            const existing = document.getElementById('devModeIndicator');
            if (existing) existing.remove();
        }
    }
    
    toggleDevMode() {
        this.devMode = !this.devMode;
        
        if (this.devMode) {
            const notification = document.createElement('div');
            notification.id = 'devModeNotification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 0, 0, 0.9);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                font-weight: bold;
                z-index: 1000;
                border: 2px solid #ff4444;
            `;
            notification.innerHTML = '🛠️ DEV MODE ACTIVATED<br>All levels unlocked!';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (document.getElementById('devModeNotification')) {
                    document.getElementById('devModeNotification').remove();
                }
            }, 3000);
            
            console.log('Dev Mode: ON - All levels unlocked for testing');
        } else {
            const existing = document.getElementById('devModeNotification');
            if (existing) existing.remove();
            
            console.log('Dev Mode: OFF - Normal progression restored');
        }
        
        if (document.getElementById('levelSelector').style.display !== 'none') {
            this.createLevelGrid();
        }
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            }
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.isShiftHeld = true;
                document.getElementById('powerJumpIndicator').style.opacity = '1';
            }
            
            if (e.ctrlKey && e.code === 'KeyD') {
                e.preventDefault();
                this.toggleDevMode();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.isShiftHeld = false;
                document.getElementById('powerJumpIndicator').style.opacity = '0';
            }
        });
        
        this.gameContainer.addEventListener('click', () => {
            this.jump();
        });
    }
    
    startLevel(levelNum) {
        this.gameMode = 'levels';
        this.currentLevel = levelNum;
        this.setupLevel();
        this.startGame();
    }
    
    startEndless() {
        this.gameMode = 'endless';
        this.currentLevel = null;
        this.progressContainer.style.display = 'none';
        this.modeInfo.textContent = 'Endless Mode';
        this.startGame();
    }
    
    setupLevel() {
        const level = this.levels[this.currentLevel];
        this.levelLength = level.length;
        this.levelObstacles = [...level.obstacles];
        this.obstacleIndex = 0;
        this.levelProgress = 0;
        
        this.progressContainer.style.display = 'block';
        this.levelInfo.textContent = `Level ${this.currentLevel}: ${level.name}`;
        this.modeInfo.textContent = 'Level Mode';
        this.updateProgress();
    }
    
    startGame() {
        document.getElementById('modeSelector').style.display = 'none';
        document.getElementById('levelSelector').style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.levelCompleteScreen.style.display = 'none';
        
        this.obstacles.forEach(obs => obs.element.remove());
        this.obstacles = [];
        this.score = 0;
        this.frameCount = 0;
        this.gameSpeed = this.gameMode === 'levels' ? 4 : 3;
        this.gameRunning = true;
        
        this.playerY = this.gameHeight - this.groundHeight - 30;
        this.velocityY = 0;
        this.isGrounded = true;
        this.isShiftHeld = false;
        this.updatePlayerPosition();
        
        this.player.style.transform = 'rotate(0deg)';
        this.player.style.filter = 'none';
        document.getElementById('powerJumpIndicator').style.opacity = '0';
        
        this.gameLoop();
    }
    
    jump() {
        if (this.isGrounded && this.gameRunning) {
            const jumpForce = this.isShiftHeld ? this.powerJumpPower : this.jumpPower;
            this.velocityY = jumpForce;
            this.isGrounded = false;
            
            if (this.isShiftHeld) {
                this.player.style.transform = 'rotate(45deg) scale(1.1)';
                this.player.style.filter = 'brightness(1.3)';
            } else {
                this.player.style.transform = 'rotate(45deg)';
                this.player.style.filter = 'none';
            }
        }
    }
    
    updatePlayer() {
        if (!this.isGrounded) {
            this.velocityY += this.gravity;
            this.playerY += this.velocityY;
        }
        
        const groundLevel = this.gameHeight - this.groundHeight - this.playerHeight;
        if (this.playerY >= groundLevel) {
            this.playerY = groundLevel;
            this.velocityY = 0;
            this.isGrounded = true;
            this.player.style.transform = 'rotate(0deg)';
            this.player.style.filter = 'none';
        }
        
        if (!this.isGrounded && this.velocityY > 0) {
            this.checkPlatformLanding();
        }
        
        if (this.isGrounded && this.playerY < groundLevel) {
            if (!this.isAbovePlatform()) {
                this.isGrounded = false;
            }
        }
        
        this.updatePlayerPosition();
    }
    
    isAbovePlatform() {
        const playerLeft = this.playerX;
        const playerRight = this.playerX + this.playerWidth;
        const playerBottom = this.playerY + this.playerHeight;
        
        for (const obstacle of this.obstacles) {
            if (obstacle.type === 'platform') {
                const platformLeft = obstacle.x;
                const platformRight = obstacle.x + obstacle.width;
                const platformTop = obstacle.y - obstacle.height;
                
                if (playerRight > platformLeft && 
                    playerLeft < platformRight && 
                    Math.abs(playerBottom - platformTop) < 5) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkPlatformLanding() {
        const playerLeft = this.playerX;
        const playerRight = this.playerX + this.playerWidth;
        const playerBottom = this.playerY + this.playerHeight;
        const nextPlayerBottom = playerBottom + this.velocityY;
        
        for (const obstacle of this.obstacles) {
            if (obstacle.type === 'platform') {
                const platformLeft = obstacle.x;
                const platformRight = obstacle.x + obstacle.width;
                const platformTop = obstacle.y - obstacle.height;
                
                if (playerRight > platformLeft && 
                    playerLeft < platformRight && 
                    playerBottom <= platformTop && 
                    nextPlayerBottom >= platformTop) {
                    
                    this.playerY = platformTop - this.playerHeight;
                    this.velocityY = 0;
                    this.isGrounded = true;
                    this.player.style.transform = 'rotate(0deg)';
                    return;
                }
            }
        }
    }
    
    updatePlayerPosition() {
        this.player.style.left = this.playerX + 'px';
        this.player.style.bottom = (this.gameHeight - this.playerY - this.playerHeight) + 'px';
    }
    
    createObstacle(type = null, x = null, customWidth = null, customHeight = null) {
        const types = ['spike', 'block', 'platform'];
        const obstacleType = type || types[Math.floor(Math.random() * types.length)];
        const startX = x !== null ? x : this.gameWidth;
        
        let width, height;
        if (obstacleType === 'spike') {
            width = 30;
            height = 40;
        } else if (obstacleType === 'platform') {
            width = customWidth || 60;
            height = customHeight || 30;
        } else {
            width = customWidth || 40;
            height = customHeight || 60;
        }
        
        const obstacle = {
            x: startX,
            y: this.gameHeight - this.groundHeight,
            width: width,
            height: height,
            type: obstacleType,
            element: document.createElement('div')
        };
        
        obstacle.element.className = `obstacle ${obstacleType}`;
        
        if (obstacleType === 'block' || obstacleType === 'platform') {
            obstacle.element.style.width = obstacle.width + 'px';
            obstacle.element.style.height = obstacle.height + 'px';
            obstacle.y -= obstacle.height;
        }
        
        obstacle.element.style.left = obstacle.x + 'px';
        obstacle.element.style.bottom = (this.gameHeight - obstacle.y) + 'px';
        
        this.gameContainer.appendChild(obstacle.element);
        this.obstacles.push(obstacle);
    }
    
    createClouds() {
        this.clouds.forEach(cloud => cloud.element.remove());
        this.clouds = [];
        
        for (let i = 0; i < 3; i++) {
            this.createCloud();
        }
    }
    
    createCloud() {
        const cloud = {
            x: Math.random() * this.gameWidth,
            y: Math.random() * (this.gameHeight - 200) + 50,
            width: Math.random() * 80 + 40,
            height: Math.random() * 40 + 20,
            speed: Math.random() * 0.5 + 0.2,
            element: document.createElement('div')
        };
        
        cloud.element.className = 'cloud';
        cloud.element.style.width = cloud.width + 'px';
        cloud.element.style.height = cloud.height + 'px';
        cloud.element.style.left = cloud.x + 'px';
        cloud.element.style.top = cloud.y + 'px';
        
        this.gameContainer.appendChild(cloud.element);
        this.clouds.push(cloud);
    }
    
    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.gameSpeed;
            obstacle.element.style.left = obstacle.x + 'px';
            
            if (obstacle.x + obstacle.width < 0) {
                obstacle.element.remove();
                this.obstacles.splice(i, 1);
                this.score += 10;
                this.scoreElement.textContent = this.score;
            }
        }
    }
    
    updateClouds() {
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            cloud.element.style.left = cloud.x + 'px';
            
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.gameWidth + Math.random() * 200;
            }
        });
    }
    
    updateProgress() {
        if (this.gameMode === 'levels') {
            this.levelProgress += this.gameSpeed;
            const progressPercent = Math.min((this.levelProgress / this.levelLength) * 100, 100);
            this.progressFill.style.width = progressPercent + '%';
            
            if (this.levelProgress >= this.levelLength) {
                this.completeLevel();
            }
        }
    }
    
    spawnLevelObstacles() {
        if (this.gameMode === 'levels' && this.obstacleIndex < this.levelObstacles.length) {
            const nextObstacle = this.levelObstacles[this.obstacleIndex];
            if (this.levelProgress >= nextObstacle.x - this.gameWidth) {
                this.createObstacle(
                    nextObstacle.type, 
                    null, 
                    nextObstacle.width, 
                    nextObstacle.height
                );
                this.obstacleIndex++;
            }
        }
    }

    completeLevel() {
        this.gameRunning = false;
        
        if (!this.completedLevels.includes(this.currentLevel)) {
            this.completedLevels.push(this.currentLevel);
            localStorage.setItem('completedLevels', JSON.stringify(this.completedLevels));
        }
        
        const nextLevel = this.currentLevel + 1;
        if (this.levels[nextLevel] && !this.unlockedLevels.includes(nextLevel)) {
            this.unlockedLevels.push(nextLevel);
            localStorage.setItem('unlockedLevels', JSON.stringify(this.unlockedLevels));
        }
        
        // Submit level completion score to leaderboard (bonus for completing levels)
        if (window.parent && window.parent !== window) {
            const completionBonus = this.score + (this.currentLevel * 1000); // Bonus points for completing levels
            window.parent.postMessage({
                type: 'game_end',
                score: completionBonus,
                gameId: 'geo-dash'
            }, '*');
        }
        
        this.levelStats.innerHTML = `
            <p>Score: ${this.score}</p>
            <p>Time: ${(this.frameCount / 60).toFixed(1)}s</p>
        `;
        this.levelCompleteScreen.style.display = 'block';
        
        this.createLevelGrid();
    }
    
    checkCollisions() {
        const playerLeft = this.playerX;
        const playerRight = this.playerX + this.playerWidth;
        const playerTop = this.playerY;
        const playerBottom = this.playerY + this.playerHeight;
        
        for (const obstacle of this.obstacles) {
            const obstacleLeft = obstacle.x;
            const obstacleRight = obstacle.x + obstacle.width;
            
            let obstacleTop, obstacleBottom;
            if (obstacle.type === 'spike') {
                obstacleBottom = obstacle.y;
                obstacleTop = obstacle.y - obstacle.height;
            } else {
                obstacleBottom = obstacle.y;
                obstacleTop = obstacle.y - obstacle.height;
            }
            
            const isOverlapping = playerRight > obstacleLeft && 
                                playerLeft < obstacleRight && 
                                playerBottom > obstacleTop && 
                                playerTop < obstacleBottom;
            
            if (isOverlapping) {
                if (obstacle.type === 'platform') {
                    const isLandingSafely = playerTop < obstacleTop && this.velocityY >= 0;
                    if (!isLandingSafely) {
                        this.gameOver();
                        return;
                    }
                } else {
                    this.gameOver();
                    return;
                }
            }
        }
    }

    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        
        // Submit score to ArcadeHub leaderboard system
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'game_end',
                score: this.score,
                gameId: 'geo-dash'
            }, '*');
        }
        
        if (this.gameMode === 'endless' && this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('geometryDashBest', this.bestScore);
            this.bestScoreElement.textContent = this.bestScore;
        }
        
        this.gameOverScreen.style.display = 'block';
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.frameCount++;
        
        this.updatePlayer();
        this.updateObstacles();
        this.updateClouds();
        this.updateProgress();
        this.checkCollisions();
        
        if (this.gameMode === 'levels') {
            this.spawnLevelObstacles();
        } else {
            // Only use random generation for endless mode
            if (this.frameCount % 120 === 0) {
                const rand = Math.random();
                if (rand < 0.4) {
                    this.createObstacle('spike');
                } else if (rand < 0.7) {
                    this.createObstacle('block');
                } else {
                    this.createObstacle('platform', null, 
                        40 + Math.random() * 40,
                        20 + Math.random() * 40
                    );
                }
            }
            
            if (this.frameCount % 600 === 0) {
                this.gameSpeed += 0.2;
            }
        }

        // Send live score updates to ArcadeHub
        if (this.gameRunning && window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'score_update',
                score: this.score
            }, '*');
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Global variables and functions
let game;

function selectMode(mode) {
    if (mode === 'levels') {
        document.getElementById('modeSelector').style.display = 'none';
        document.getElementById('levelSelector').style.display = 'block';
    } else if (mode === 'endless') {
        game.startEndless();
    }
}

function showModeSelector() {
    document.getElementById('modeSelector').style.display = 'block';
    document.getElementById('levelSelector').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('levelComplete').style.display = 'none';
}

function showLevelSelector() {
    document.getElementById('levelSelector').style.display = 'block';
    document.getElementById('levelComplete').style.display = 'none';
}

function nextLevel() {
    const nextLevel = game.currentLevel + 1;
    if (game.levels[nextLevel] && game.unlockedLevels.includes(nextLevel)) {
        game.startLevel(nextLevel);
    } else {
        showLevelSelector();
    }
}

function restartGame() {
    if (game.gameMode === 'levels') {
        game.startLevel(game.currentLevel);
    } else {
        game.startEndless();
    }
}

// Initialize the game when page loads
window.addEventListener('load', () => {
    game = new GeometryDash();
});