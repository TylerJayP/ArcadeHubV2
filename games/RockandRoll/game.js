const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Car properties
const car = {
    width: 40,
    height: 50,
    x: canvas.width / 2 - 20,
    y: canvas.height - 100,
    speed: 5
};

let leftPressed = false;
let rightPressed = false;

// Handle keyboard input
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') leftPressed = true;
    if (e.key === 'ArrowRight') rightPressed = true;
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') leftPressed = false;
    if (e.key === 'ArrowRight') rightPressed = false;
});

// Obstacle properties
const lanes = 5;
const laneWidth = canvas.width / lanes;
const noteColors = ['#0f0', '#f00', '#ff0', '#00f', '#fa0']; // green, red, yellow, blue, orange
const keyMap = ['1', '2', '3', '4', '5'];
// Move baseline up by about 100px from the car
const defaultBaselineOffset = 100;
let baselineOffset = defaultBaselineOffset;
const baselineWidth = canvas.width + 20; // 20px wider than canvas

// Set obstacleWidth for notes to fill the entire lane
const noteWidth = laneWidth;
const noteHeight = 40;
const obstacleWidth = 40; // for indestructible obstacles only
const obstacleHeight = 40;
let obstacles = [];
let obstacleTimer = 0;
let score = 0;
let gameOver = false;

let noteTimer = 0;
let blackTimer = 0;
let bpm = 120;
let waitingForBpm = true;
let obstacleSpeed = 2; // Fixed falling speed in pixels per frame
let currentSong = null;
let audio = null;
let notePattern = null;
let patternStartTime = 0;
let lastNoteIndex = 0;
let lastSpawnTime = 0;
let spawnInterval = 500; // Default .5 seconds between spawns
let backgroundImage = null;
let guitarPickImage = null;

// Load guitar pick image
function loadGuitarPick() {
    guitarPickImage = new Image();
    guitarPickImage.onload = function() {
        // Guitar pick loaded successfully
        console.log('Guitar pick loaded');
    };
    guitarPickImage.onerror = function() {
        console.log('Failed to load guitar pick image');
        guitarPickImage = null;
    };
    guitarPickImage.src = 'GuitarPick.png';
}

// Song library with hardcoded BPM, MP3 files, and album art
const songLibrary = [
    { name: "Select a song...", bpm: 120, file: null, background: null },
    { name: "Stranger - Jumpmonk", bpm: 148, file: "songs/Stranger - Jumpmonk.mp3", background: "backgrounds/Stranger.jpg" },
    { name: "Willow Tree - Homephone", bpm: 148, file: "songs/Willow Tree - Homephone.mp3", background: "backgrounds/Willow Tree.jpeg" },
    { name: "Hoobastank - The Reason", bpm: 166, file: "songs/Hoobastank - The Reason.mp3", background: "backgrounds/The Reason.jpg" },
    { name: "Hot Tea - Homephone", bpm: 90, file: "songs/Hot Tea - Homephone.mp3", background: "backgrounds/Hot Tea.jpeg" },
    { name: "Import Pattern", bpm: 120, file: null, pattern: true, background: null }
];

function loadBackground(song) {
    if (song && song.background) {
        backgroundImage = new Image();
        backgroundImage.onload = function() {
            // Background loaded successfully
        };
        backgroundImage.onerror = function() {
            console.log('Failed to load background:', song.background);
            backgroundImage = null;
        };
        backgroundImage.src = song.background;
    } else {
        backgroundImage = null;
    }
}

function drawBackground() {
    if (backgroundImage) {
        // Draw background image to fill the canvas
        ctx.save();
        ctx.globalAlpha = 0.3; // Make background semi-transparent so it doesn't interfere with gameplay
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        ctx.restore();
    } else {
        // Default gray background if no album art
        ctx.fillStyle = '#444';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function createSongSelector() {
    // Create song selection UI
    const songDiv = document.createElement('div');
    songDiv.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        z-index: 1000;
    `;
    
    songDiv.innerHTML = `
        <h2 style="color: white; margin-bottom: 20px;">Select a Song</h2>
        <select id="songSelect" style="padding: 10px; margin-bottom: 20px; width: 200px;">
            ${songLibrary.map(song => `<option value="${song.name}">${song.name}</option>`).join('')}
        </select>
        <br>
        <input type="file" id="patternFile" accept=".json" style="display: none; margin: 10px;">
        <button id="loadPattern" style="display: none; padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
            Load Pattern
        </button>
        <br>
        <button id="startGame" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Start Game
        </button>
        <br>
        <button id="openEditor" style="padding: 10px 20px; background: #FF9800; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
            Open Note Editor
        </button>
    `;
    
    document.body.appendChild(songDiv);
    
    // Handle song selection
    document.getElementById('songSelect').addEventListener('change', (e) => {
        const selectedSong = songLibrary.find(song => song.name === e.target.value);
        if (selectedSong) {
            currentSong = selectedSong;
            bpm = selectedSong.bpm;
            spawnInterval = calculateSpawnInterval();
            loadBackground(selectedSong);
            
            // Show/hide pattern file input
            const patternFile = document.getElementById('patternFile');
            const loadPattern = document.getElementById('loadPattern');
            if (selectedSong.pattern) {
                patternFile.style.display = 'inline-block';
                loadPattern.style.display = 'inline-block';
            } else {
                patternFile.style.display = 'none';
                loadPattern.style.display = 'none';
            }
        }
    });
    
    // Handle pattern file loading
    document.getElementById('loadPattern').addEventListener('click', () => {
        document.getElementById('patternFile').click();
    });
    
    document.getElementById('patternFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    notePattern = JSON.parse(e.target.result);
                    bpm = notePattern.bpm || 120;
                    spawnInterval = calculateSpawnInterval();
                    alert('Pattern loaded successfully!');
                } catch (error) {
                    alert('Error loading pattern: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    });
    
    // Handle start game
    document.getElementById('startGame').addEventListener('click', () => {
        if (currentSong && currentSong.file) {
            startAudio();
        }
        document.body.removeChild(songDiv);
        waitingForBpm = false;
        patternStartTime = Date.now();
        lastNoteIndex = 0;
        gameLoop();
    });
    
    // Handle open editor
    document.getElementById('openEditor').addEventListener('click', () => {
        window.open('editor.html', '_blank');
    });
}

function startAudio() {
    if (currentSong && currentSong.file) {
        audio = new Audio(currentSong.file);
        audio.volume = 0.7;
        audio.play().catch(e => {
            console.log('Audio playback failed:', e);
            // Continue game without audio if file not found
        });
    }
}

function stopAudio() {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
}

function promptForBpm() {
    waitingForBpm = true;
    createSongSelector();
}

function checkCollision(rect1, rect2) {
    // For guitar pick, use a more precise collision detection
    if (guitarPickImage) {
        // Use the scaled dimensions of the guitar pick for collision
        const scaleX = car.width / guitarPickImage.width;
        const scale = scaleX * 2; // Double the size to match drawing
        
        const scaledWidth = guitarPickImage.width * scale;
        const scaledHeight = guitarPickImage.height * scale;
        
        // Shrink the hitbox by 75% (25% of original size)
        const hitboxWidth = scaledWidth * 0.25;
        const hitboxHeight = scaledHeight * 0.25;
        
        const pickX = car.x + (car.width - scaledWidth) / 2;
        const pickY = car.y + (car.height - scaledHeight) / 2;
        
        // Center the hitbox within the guitar pick
        const hitboxX = pickX + (scaledWidth - hitboxWidth) / 2;
        const hitboxY = pickY + (scaledHeight - hitboxHeight) / 2;
        
        // Check collision with the smaller hitbox
        return (
            hitboxX < rect2.x + rect2.width &&
            hitboxX + hitboxWidth > rect2.x &&
            hitboxY < rect2.y + rect2.height &&
            hitboxY + hitboxHeight > rect2.y
        );
    } else {
        // Fallback to original rectangle collision
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
}

function drawCar() {
    if (guitarPickImage) {
        // Draw guitar pick image
        ctx.save();
        // Scale the guitar pick to match the car's width, then make it 2x bigger
        const scaleX = car.width / guitarPickImage.width;
        const scale = scaleX * 2; // Double the size
        
        const scaledWidth = guitarPickImage.width * scale;
        const scaledHeight = guitarPickImage.height * scale;
        
        // Center the image horizontally and vertically in the car's position
        const x = car.x + (car.width - scaledWidth) / 2;
        const y = car.y + (car.height - scaledHeight) / 2;
        
        ctx.drawImage(guitarPickImage, x, y, scaledWidth, scaledHeight);
        ctx.restore();
    } else {
        // Fallback to green rectangle if image fails to load
        ctx.fillStyle = '#0f0';
        ctx.fillRect(car.x, car.y, car.width, car.height);
    }
}

function drawObstacle(obstacle) {
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    if (obstacle.type === 'note') {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
}

function calculateSpawnInterval() {
    // Calculate spawn interval based on BPM
    // Spawn notes every beat for more intense rhythm gameplay
    const beatsPerSpawn = 1; // Spawn every beat
    const secondsPerBeat = 60 / bpm;
    const secondsPerSpawn = secondsPerBeat * beatsPerSpawn;
    return secondsPerSpawn * 1000; // Convert to milliseconds
}

function spawnObstacles() {
    if (notePattern && notePattern.notes) {
        // Spawn notes from pattern
        const currentTime = (Date.now() - patternStartTime) / 1000;
        
        while (lastNoteIndex < notePattern.notes.length) {
            const note = notePattern.notes[lastNoteIndex];
            if (note.time <= currentTime + 2) { // Spawn notes 2 seconds ahead
                obstacles.push({
                    type: 'note',
                    lane: note.lane,
                    x: note.lane * laneWidth,
                    y: -noteHeight,
                    width: noteWidth,
                    height: noteHeight,
                    color: noteColors[note.lane],
                    key: keyMap[note.lane],
                    hit: false
                });
                lastNoteIndex++;
            } else {
                break;
            }
        }
    } else {
        // BPM-based spawning - spawn notes at controlled intervals
        const currentTime = Date.now();
        
        if (currentTime - lastSpawnTime >= spawnInterval) {
            const noteLane = Math.floor(Math.random() * lanes);
            obstacles.push({
                type: 'note',
                lane: noteLane,
                x: noteLane * laneWidth,
                y: -noteHeight,
                width: noteWidth,
                height: noteHeight,
                color: noteColors[noteLane],
                key: keyMap[noteLane],
                hit: false
            });
            
            // Occasionally spawn black obstacle in a different lane
            if (Math.random() < 0.3) { // 30% chance
                const availableLanes = [];
                for (let lane = 0; lane < lanes; lane++) {
                    if (lane === noteLane) continue;
                    const hasObstacleAtTop = obstacles.some(ob => ob.lane === lane && ob.y < noteHeight);
                    if (!hasObstacleAtTop) availableLanes.push(lane);
                }
                if (availableLanes.length > 0) {
                    const blackLane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
                    obstacles.push({
                        type: 'indestructible',
                        lane: blackLane,
                        x: blackLane * laneWidth,
                        y: -noteHeight,
                        width: noteWidth,
                        height: noteHeight,
                        color: '#000',
                    });
                }
            }
            
            lastSpawnTime = currentTime;
        }
    }
}

function drawBaseline() {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-25, car.y - baselineOffset + noteHeight / 2);
    ctx.lineTo(canvas.width + 25, car.y - baselineOffset + noteHeight / 2);
    ctx.stroke();
}

function resetGame() {
    obstacles = [];
    obstacleTimer = 0;
    score = 0;
    car.x = canvas.width / 2 - car.width / 2;
    gameOver = false;
    notePattern = null;
    lastNoteIndex = 0;
    baselineOffset = defaultBaselineOffset;
    lastSpawnTime = 0;
    stopAudio();
    loadGuitarPick(); // Load guitar pick image
    promptForBpm();
}

function update() {
    if (gameOver || waitingForBpm) return;
    
    // Move car
    if (leftPressed && car.x > 0) {
        car.x -= car.speed;
    }
    if (rightPressed && car.x < canvas.width - car.width) {
        car.x += car.speed;
    }
    
    // Spawn obstacles based on BPM or pattern
    spawnObstacles();
    
    // Move obstacles at consistent speed
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].y += obstacleSpeed;
    }
    
    // Remove off-screen obstacles only (notes and indestructibles)
    obstacles = obstacles.filter(ob => ob.y < canvas.height && (ob.type !== 'note' || !ob.hit));
    
    // Check collisions for indestructible obstacles and notes
    for (let i = 0; i < obstacles.length; i++) {
        const ob = obstacles[i];
        if (ob.type === 'indestructible' && checkCollision(car, ob)) {
            gameOver = true;
        }
        if (ob.type === 'note' && !ob.hit && checkCollision(car, ob)) {
            gameOver = true;
        }
    }
    
    // Penalty for missed notes: move baseline down by 10px for each missed note
    for (let i = 0; i < obstacles.length; i++) {
        const ob = obstacles[i];
        if (
            ob.type === 'note' &&
            !ob.hit &&
            ob.y > (car.y - baselineOffset + noteHeight / 2)
        ) {
            ob.hit = true; // Mark as processed
            baselineOffset -= 10;
            if (baselineOffset < 0) baselineOffset = 0;
        }
    }
    
    if (!gameOver) score++;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawCar();
    drawBaseline();
    obstacles.forEach(drawObstacle);
    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    // Draw game over
    if (gameOver) {
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 40);
        ctx.textAlign = 'start';
    }
}

function gameLoop() {
    update();
    draw();
    if (!gameOver && !waitingForBpm) {
        requestAnimationFrame(gameLoop);
    }
}

// On initial load, load guitar pick and prompt for BPM
loadGuitarPick();
promptForBpm();
if (!waitingForBpm) gameLoop();

// Restart game on R key
window.addEventListener('keydown', (e) => {
    if (gameOver && (e.key === 'r' || e.key === 'R')) {
        resetGame();
    }
});

// Handle note hits
window.addEventListener('keydown', (e) => {
    if (gameOver && (e.key === 'r' || e.key === 'R')) {
        resetGame();
        return;
    }
    // Check for note hit
    const keyIndex = keyMap.indexOf(e.key);
    if (keyIndex !== -1) {
        for (let i = 0; i < obstacles.length; i++) {
            const ob = obstacles[i];
            if (
                ob.type === 'note' &&
                ob.lane === keyIndex &&
                !ob.hit &&
                Math.abs((ob.y + ob.height / 2) - (car.y - baselineOffset + noteHeight / 2)) < 30 // Increased hit window to 30px
            ) {
                ob.hit = true;
                score += 50; // Bonus for hitting note
                break;
            }
        }
    }
}); 