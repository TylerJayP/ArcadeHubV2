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
        
        // Editor properties
        this.editorMode = false;
        this.editorObstacles = [];
        this.selectedTool = 'spike';
        this.selectedObstacle = null;
        this.isDragging = false;
        this.draggedObstacle = null;
        this.dragOffset = { x: 0, y: 0 };
        this.customLevels = JSON.parse(localStorage.getItem('customLevels')) || [];
        this.currentCustomLevel = null;
        
        // Dev mode properties
        this.devMode = false;
        
        this.levels = this.createLevels();
        this.init();
    }
    
    createLevels() {
        return {
            1: {
                name: "Spike Gauntlet",
                length: 2000,
                obstacles: [
                    {x: 200, type: 'spike'},
                    {x: 320, type: 'spike'},
                    {x: 480, type: 'platform', width: 60, height: 40},
                    {x: 620, type: 'spike'},
                    {x: 740, type: 'spike'},
                    {x: 880, type: 'block'},
                    {x: 1020, type: 'spike'},
                    {x: 1180, type: 'platform', width: 50, height: 60},
                    {x: 1320, type: 'spike'},
                    {x: 1460, type: 'spike'},
                    {x: 1600, type: 'platform', width: 70, height: 30},
                    {x: 1760, type: 'spike'},
                    {x: 1900, type: 'spike'}
                ]
            },
            2: {
                name: "Block Fortress",
                length: 2200,
                obstacles: [
                    {x: 180, type: 'block'},
                    {x: 320, type: 'platform', width: 50, height: 70},
                    {x: 480, type: 'block'},
                    {x: 620, type: 'spike'},
                    {x: 760, type: 'block'},
                    {x: 920, type: 'platform', width: 60, height: 40},
                    {x: 1080, type: 'block'},
                    {x: 1220, type: 'spike'},
                    {x: 1360, type: 'block'},
                    {x: 1520, type: 'platform', width: 45, height: 80},
                    {x: 1680, type: 'spike'},
                    {x: 1820, type: 'block'},
                    {x: 1980, type: 'spike'},
                    {x: 2120, type: 'block'}
                ]
            },
            3: {
                name: "Platform Nightmare",
                length: 2400,
                obstacles: [
                    {x: 160, type: 'platform', width: 50, height: 50},
                    {x: 300, type: 'spike'},
                    {x: 440, type: 'platform', width: 40, height: 70},
                    {x: 580, type: 'spike'},
                    {x: 720, type: 'platform', width: 55, height: 30},
                    {x: 860, type: 'block'},
                    {x: 1000, type: 'platform', width: 45, height: 60},
                    {x: 1140, type: 'spike'},
                    {x: 1280, type: 'platform', width: 60, height: 40},
                    {x: 1420, type: 'spike'},
                    {x: 1560, type: 'platform', width: 40, height: 80},
                    {x: 1700, type: 'spike'},
                    {x: 1840, type: 'platform', width: 50, height: 25},
                    {x: 1980, type: 'block'},
                    {x: 2120, type: 'platform', width: 45, height: 55},
                    {x: 2260, type: 'spike'}
                ]
            },
            4: {
                name: "Chaos Theory",
                length: 2600,
                obstacles: [
                    {x: 140, type: 'spike'},
                    {x: 260, type: 'platform', width: 40, height: 45},
                    {x: 380, type: 'spike'},
                    {x: 500, type: 'block'},
                    {x: 620, type: 'spike'},
                    {x: 760, type: 'platform', width: 50, height: 70},
                    {x: 900, type: 'spike'},
                    {x: 1020, type: 'spike'},
                    {x: 1160, type: 'block'},
                    {x: 1300, type: 'platform', width: 45, height: 30},
                    {x: 1440, type: 'spike'},
                    {x: 1580, type: 'block'},
                    {x: 1720, type: 'spike'},
                    {x: 1860, type: 'platform', width: 40, height: 60},
                    {x: 2000, type: 'spike'},
                    {x: 2140, type: 'spike'},
                    {x: 2280, type: 'block'},
                    {x: 2420, type: 'platform', width: 55, height: 40},
                    {x: 2560, type: 'spike'}
                ]
            },
            5: {
                name: "The Crucible",
                length: 3000,
                obstacles: [
                    {x: 120, type: 'spike'},
                    {x: 240, type: 'platform', width: 40, height: 50},
                    {x: 360, type: 'spike'},
                    {x: 480, type: 'spike'},
                    {x: 620, type: 'block'},
                    {x: 760, type: 'platform', width: 45, height: 70},
                    {x: 900, type: 'spike'},
                    {x: 1020, type: 'spike'},
                    {x: 1160, type: 'platform', width: 50, height: 30},
                    {x: 1300, type: 'spike'},
                    {x: 1440, type: 'block'},
                    {x: 1580, type: 'spike'},
                    {x: 1720, type: 'platform', width: 40, height: 60},
                    {x: 1860, type: 'spike'},
                    {x: 1980, type: 'spike'},
                    {x: 2120, type: 'block'},
                    {x: 2260, type: 'platform', width: 55, height: 40},
                    {x: 2400, type: 'spike'},
                    {x: 2520, type: 'spike'},
                    {x: 2660, type: 'platform', width: 45, height: 80},
                    {x: 2800, type: 'spike'},
                    {x: 2940, type: 'spike'}
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
    
    startCustomLevel(levelData) {
        this.gameMode = 'custom';
        this.currentCustomLevel = levelData;
        this.levelLength = levelData.length;
        this.levelObstacles = [...levelData.obstacles];
        this.obstacleIndex = 0;
        this.levelProgress = 0;
        
        this.progressContainer.style.display = 'block';
        this.levelInfo.textContent = `Custom: ${levelData.name}`;
        this.modeInfo.textContent = 'Custom Level';
        this.updateProgress();
        this.startGame();
    }
    
    openLevelEditor() {
        this.editorMode = true;
        this.clearSelection();
        document.getElementById('customLevelSelector').style.display = 'none';
        document.getElementById('levelEditor').style.display = 'block';
        this.editorObstacles = [];
        this.setupEditorCanvas();
    }
    
    setupEditorCanvas() {
        const canvas = document.getElementById('editorCanvas');
        canvas.style.width = '3000px';
        
        canvas.onclick = (e) => this.handleCanvasClick(e);
        canvas.onmousedown = (e) => this.handleMouseDown(e);
        canvas.onmousemove = (e) => this.handleMouseMove(e);
        canvas.onmouseup = (e) => this.handleMouseUp(e);
        
        canvas.ondragstart = () => false;
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        this.updateSizeControls();
    }
    
    handleCanvasClick(e) {
        if (this.isDragging) return;
        
        const canvas = document.getElementById('editorCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + canvas.scrollLeft;
        const y = e.clientY - rect.top;
        
        this.clearSelection();
        
        if (this.selectedTool === 'delete') {
            this.deleteObstacleAt(x, y);
        } else {
            this.placeObstacle(x, y);
        }
    }
    
    clearSelection() {
        if (this.selectedObstacle) {
            const element = document.getElementById('editor-' + this.selectedObstacle.id);
            if (element) {
                element.classList.remove('selected');
            }
            this.selectedObstacle = null;
        }
    }
    
    selectObstacle(obstacle) {
        this.clearSelection();
        this.selectedObstacle = obstacle;
        const element = document.getElementById('editor-' + obstacle.id);
        if (element) {
            element.classList.add('selected');
        }
    }
    
    handleMouseDown(e) {
        const canvas = document.getElementById('editorCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + canvas.scrollLeft;
        const y = e.clientY - rect.top;
        
        const clickedObstacle = this.getObstacleAt(x, y);
        if (clickedObstacle && this.selectedTool !== 'delete') {
            this.isDragging = true;
            this.draggedObstacle = clickedObstacle;
            this.selectObstacle(clickedObstacle);
            
            this.dragOffset.x = x - clickedObstacle.x;
            this.dragOffset.y = y - clickedObstacle.y;
            
            const element = document.getElementById('editor-' + clickedObstacle.id);
            if (element) {
                element.style.opacity = '0.7';
                element.style.zIndex = '1000';
            }
            
            e.preventDefault();
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDragging || !this.draggedObstacle) return;
        
        const canvas = document.getElementById('editorCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + canvas.scrollLeft;
        const y = e.clientY - rect.top;
        
        const newX = Math.round((x - this.dragOffset.x) / 20) * 20;
        const newY = Math.round((y - this.dragOffset.y) / 20) * 20;
        
        const canvasHeight = 340;
        this.draggedObstacle.x = Math.max(0, newX);
        this.draggedObstacle.y = Math.max(this.draggedObstacle.height, Math.min(canvasHeight - 20, newY));
        
        this.updateObstaclePosition(this.draggedObstacle);
    }
    
    updateObstaclePosition(obstacle) {
        const element = document.getElementById('editor-' + obstacle.id);
        if (element) {
            if (obstacle.type === 'spike') {
                element.style.left = (obstacle.x - 15) + 'px';
                element.style.top = (obstacle.y - obstacle.height) + 'px';
            } else {
                element.style.left = obstacle.x + 'px';
                element.style.top = (obstacle.y - obstacle.height) + 'px';
            }
        }
    }
    
    handleMouseUp(e) {
        if (this.isDragging && this.draggedObstacle) {
            const element = document.getElementById('editor-' + this.draggedObstacle.id);
            if (element) {
                element.style.opacity = '1';
                element.style.zIndex = 'auto';
            }
            
            this.isDragging = false;
            this.draggedObstacle = null;
        }
    }
    
    getObstacleAt(x, y) {
        return this.editorObstacles.find(obs => {
            const obsLeft = obs.type === 'spike' ? obs.x - 15 : obs.x;
            const obsRight = obs.type === 'spike' ? obs.x + 15 : obs.x + obs.width;
            const obsTop = obs.y - obs.height;
            const obsBottom = obs.y;
            
            return x >= obsLeft && x <= obsRight && y >= obsTop && y <= obsBottom;
        });
    }
    
    handleKeyDown(e) {
        if (!this.editorMode || !this.selectedObstacle) return;
        
        const moveAmount = e.shiftKey ? 20 : 5;
        let moved = false;
        
        switch(e.key) {
            case 'ArrowLeft':
                this.selectedObstacle.x = Math.max(0, this.selectedObstacle.x - moveAmount);
                moved = true;
                break;
            case 'ArrowRight':
                this.selectedObstacle.x += moveAmount;
                moved = true;
                break;
            case 'ArrowUp':
                this.selectedObstacle.y = Math.max(this.selectedObstacle.height, this.selectedObstacle.y - moveAmount);
                moved = true;
                break;
            case 'ArrowDown':
                this.selectedObstacle.y = Math.min(340 - 20, this.selectedObstacle.y + moveAmount);
                moved = true;
                break;
            case 'Delete':
            case 'Backspace':
                this.deleteObstacle(this.selectedObstacle.id);
                moved = true;
                break;
        }
        
        if (moved) {
            e.preventDefault();
            if (this.selectedObstacle) {
                this.updateObstaclePosition(this.selectedObstacle);
            }
        }
    }
    
    placeObstacle(x, y) {
        if (this.selectedTool === 'delete') return;
        
        const canvasHeight = 340;
        
        let width, height;
        if (this.selectedTool === 'spike') {
            width = 30;
            height = 40;
        } else {
            width = parseInt(document.getElementById('widthInput').value) || 60;
            height = parseInt(document.getElementById('heightInput').value) || 40;
        }
        
        const snappedX = Math.round(x / 20) * 20;
        const snappedY = Math.max(height, Math.min(canvasHeight - 20, Math.round(y / 20) * 20));
        
        const obstacle = {
            x: snappedX,
            y: snappedY,
            width: width,
            height: height,
            type: this.selectedTool,
            id: Date.now() + Math.random()
        };
        
        this.editorObstacles.push(obstacle);
        this.renderEditorObstacle(obstacle);
        this.selectObstacle(obstacle);
    }
    
    renderEditorObstacle(obstacle) {
        const element = document.createElement('div');
        element.className = `editor-obstacle ${obstacle.type}`;
        element.id = 'editor-' + obstacle.id;
        
        if (obstacle.type === 'spike') {
            element.style.left = (obstacle.x - 15) + 'px';
            element.style.top = (obstacle.y - obstacle.height) + 'px';
        } else {
            element.style.width = obstacle.width + 'px';
            element.style.height = obstacle.height + 'px';
            element.style.left = obstacle.x + 'px';
            element.style.top = (obstacle.y - obstacle.height) + 'px';
        }
        
        element.style.cursor = this.selectedTool === 'delete' ? 'pointer' : 'move';
        
        element.onclick = (e) => {
            e.stopPropagation();
            if (this.selectedTool === 'delete') {
                this.deleteObstacle(obstacle.id);
            } else {
                this.selectObstacle(obstacle);
            }
        };
        
        document.getElementById('editorCanvas').appendChild(element);
    }
    
    deleteObstacleAt(x, y) {
        const obstacle = this.getObstacleAt(x, y);
        if (obstacle) {
            this.deleteObstacle(obstacle.id);
        }
    }
    
    deleteObstacle(id) {
        if (this.selectedObstacle && this.selectedObstacle.id === id) {
            this.clearSelection();
        }
        
        this.editorObstacles = this.editorObstacles.filter(obs => obs.id !== id);
        const element = document.getElementById('editor-' + id);
        if (element) element.remove();
    }
    
    updateSizeControls() {
        const sizeControls = document.getElementById('sizeControls');
        if (this.selectedTool === 'platform' || this.selectedTool === 'block') {
            sizeControls.style.display = 'flex';
        } else {
            sizeControls.style.display = 'none';
        }
        
        const deleteBtn = document.getElementById('deleteToggle');
        if (this.selectedTool === 'delete') {
            deleteBtn.style.background = '#FF6666';
            deleteBtn.textContent = '✅ Delete Mode ON';
        } else {
            deleteBtn.style.background = '#FF4444';
            deleteBtn.textContent = '🗑️ Delete Mode';
        }
        
        document.querySelectorAll('.editor-obstacle').forEach(element => {
            element.style.cursor = this.selectedTool === 'delete' ? 'pointer' : 'move';
        });
    }
    
    clearEditorLevel() {
        this.clearSelection();
        this.editorObstacles = [];
        document.querySelectorAll('.editor-obstacle').forEach(el => el.remove());
    }
    
    saveEditorLevel() {
        const nameInput = document.getElementById('levelNameInput');
        const levelName = nameInput.value.trim() || 'Custom Level ' + (this.customLevels.length + 1);
        
        if (this.editorObstacles.length === 0) {
            alert('Add some obstacles before saving!');
            return;
        }
        
        const maxX = Math.max(...this.editorObstacles.map(obs => obs.x));
        const levelLength = maxX + 500;
        
        const level = {
            name: levelName,
            length: levelLength,
            obstacles: this.editorObstacles.map(obs => ({
                x: obs.x,
                type: obs.type,
                width: obs.width,
                height: obs.height,
                y: 350 + ((340 - obs.y) / 340) * 50
            })),
            created: Date.now()
        };
        
        this.customLevels.push(level);
        localStorage.setItem('customLevels', JSON.stringify(this.customLevels));
        
        alert('Level saved successfully!');
        nameInput.value = '';
        this.updateCustomLevelList();
    }
    
    testEditorLevel() {
        if (this.editorObstacles.length === 0) {
            alert('Add some obstacles before testing!');
            return;
        }
        
        const maxX = Math.max(...this.editorObstacles.map(obs => obs.x));
        const testLevel = {
            name: 'Test Level',
            length: maxX + 500,
            obstacles: this.editorObstacles.map(obs => ({
                x: obs.x,
                type: obs.type,
                width: obs.width,
                height: obs.height,
                y: 350 + ((340 - obs.y) / 340) * 50
            }))
        };
        
        document.getElementById('levelEditor').style.display = 'none';
        this.startCustomLevel(testLevel);
    }
    
    updateCustomLevelList() {
        const list = document.getElementById('customLevelList');
        list.innerHTML = '';
        
        if (this.customLevels.length === 0) {
            list.innerHTML = '<p style="color: #888;">No custom levels yet. Create your first level!</p>';
            return;
        }
        
        this.customLevels.forEach((level, index) => {
            const item = document.createElement('div');
            item.className = 'custom-level-item';
            item.innerHTML = `
                <div>
                    <strong>${level.name}</strong>
                    <br><small>${level.obstacles.length} obstacles</small>
                </div>
                <div>
                    <button onclick="game.playCustomLevel(${index})" style="margin-right: 10px;">Play</button>
                    <button class="delete-level-btn" onclick="game.deleteCustomLevel(${index})">Delete</button>
                </div>
            `;
            list.appendChild(item);
        });
    }
    
    playCustomLevel(index) {
        const level = this.customLevels[index];
        document.getElementById('customLevelSelector').style.display = 'none';
        this.startCustomLevel(level);
    }
    
    deleteCustomLevel(index) {
        if (confirm('Delete this custom level?')) {
            this.customLevels.splice(index, 1);
            localStorage.setItem('customLevels', JSON.stringify(this.customLevels));
            this.updateCustomLevelList();
        }
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
    } else if (mode === 'creator') {
        document.getElementById('modeSelector').style.display = 'none';
        document.getElementById('customLevelSelector').style.display = 'block';
        game.updateCustomLevelList();
    }
}

function selectObjectType() {
    const dropdown = document.getElementById('objectSelect');
    const selectedValue = dropdown.value;
    game.selectedTool = selectedValue;
    game.updateSizeControls();
    
    if (game.selectedTool !== 'delete') {
        game.updateSizeControls();
    }
}

function selectTool(tool) {
    if (tool === 'delete') {
        if (game.selectedTool === 'delete') {
            const dropdown = document.getElementById('objectSelect');
            game.selectedTool = dropdown.value;
        } else {
            game.selectedTool = 'delete';
        }
    } else {
        game.selectedTool = tool;
        document.getElementById('objectSelect').value = tool;
    }
    
    game.updateSizeControls();
}

function openLevelEditor() {
    game.openLevelEditor();
}

function testLevel() {
    game.testEditorLevel();
}

function saveLevel() {
    game.saveEditorLevel();
}

function clearLevel() {
    if (confirm('Clear all obstacles?')) {
        game.clearEditorLevel();
    }
}

function exitEditor() {
    game.editorMode = false;
    game.clearSelection();
    document.getElementById('levelEditor').style.display = 'none';
    document.getElementById('customLevelSelector').style.display = 'block';
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
    } else if (game.gameMode === 'custom') {
        game.startCustomLevel(game.currentCustomLevel);
    } else {
        game.startEndless();
    }
}

// Initialize the game when page loads
window.addEventListener('load', () => {
    game = new GeometryDash();
});