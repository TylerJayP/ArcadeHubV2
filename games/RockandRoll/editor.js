class NoteEditor {
    constructor() {
        this.audio = null;
        this.notes = [];
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.bpm = 120;
        this.selectedLane = 0;
        this.pixelsPerSecond = 50; // Timeline scale
        
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        this.audioFileInput = document.getElementById('audioFile');
        this.playBtn = document.getElementById('playBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.bpmInput = document.getElementById('bpmInput');
        this.laneSelect = document.getElementById('laneSelect');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.playhead = document.getElementById('playhead');
        this.lanes = document.querySelectorAll('.lane');
    }
    
    bindEvents() {
        this.audioFileInput.addEventListener('change', (e) => this.loadAudio(e));
        this.playBtn.addEventListener('click', () => this.play());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.bpmInput.addEventListener('change', (e) => this.bpm = parseInt(e.target.value));
        this.laneSelect.addEventListener('change', (e) => this.selectedLane = parseInt(e.target.value));
        this.exportBtn.addEventListener('click', () => this.exportPattern());
        this.importBtn.addEventListener('click', () => this.importPattern());
        this.clearBtn.addEventListener('click', () => this.clearNotes());
        
        // Add click listeners to lanes
        this.lanes.forEach(lane => {
            lane.addEventListener('click', (e) => this.placeNote(e, lane));
        });
        
        // Update playhead position
        setInterval(() => this.updatePlayhead(), 16); // ~60fps
    }
    
    loadAudio(event) {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            this.audio = new Audio(url);
            this.audio.addEventListener('loadedmetadata', () => {
                this.duration = this.audio.duration;
                this.updateTimeDisplay();
            });
            this.audio.addEventListener('timeupdate', () => {
                this.currentTime = this.audio.currentTime;
                this.updateTimeDisplay();
            });
            this.audio.addEventListener('ended', () => {
                this.isPlaying = false;
                this.updateButtons();
            });
        }
    }
    
    play() {
        if (this.audio) {
            this.audio.play();
            this.isPlaying = true;
            this.updateButtons();
        }
    }
    
    pause() {
        if (this.audio) {
            this.audio.pause();
            this.isPlaying = false;
            this.updateButtons();
        }
    }
    
    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.isPlaying = false;
            this.updateButtons();
        }
    }
    
    updateButtons() {
        this.playBtn.disabled = !this.audio || this.isPlaying;
        this.pauseBtn.disabled = !this.audio || !this.isPlaying;
        this.stopBtn.disabled = !this.audio;
    }
    
    updateTimeDisplay() {
        const current = this.formatTime(this.currentTime);
        const total = this.formatTime(this.duration);
        this.timeDisplay.textContent = `${current} / ${total}`;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updatePlayhead() {
        if (this.audio && this.duration > 0) {
            const progress = this.currentTime / this.duration;
            const timelineWidth = document.querySelector('.timeline').offsetWidth - 40; // Account for padding
            const position = progress * timelineWidth;
            this.playhead.style.left = `${position}px`;
        }
    }
    
    placeNote(event, lane) {
        if (!this.audio) return;
        
        const laneElement = event.currentTarget;
        const laneIndex = parseInt(laneElement.dataset.lane);
        const rect = laneElement.getBoundingClientRect();
        const clickY = event.clientY - rect.top;
        
        // Convert Y position to time
        const laneHeight = laneElement.offsetHeight;
        const timeProgress = clickY / laneHeight;
        const noteTime = timeProgress * this.duration;
        
        // Create note object
        const note = {
            time: noteTime,
            lane: laneIndex,
            duration: 0.5 // Default note duration
        };
        
        this.notes.push(note);
        this.renderNote(note, laneElement);
    }
    
    renderNote(note, laneElement) {
        const noteElement = document.createElement('div');
        noteElement.className = `note lane-${note.lane + 1}`;
        noteElement.style.top = `${(note.time / this.duration) * 100}%`;
        noteElement.style.height = '20px';
        noteElement.dataset.time = note.time;
        noteElement.dataset.lane = note.lane;
        
        // Add delete functionality
        noteElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteNote(note, noteElement);
        });
        
        laneElement.appendChild(noteElement);
    }
    
    deleteNote(note, element) {
        const index = this.notes.findIndex(n => n.time === note.time && n.lane === note.lane);
        if (index > -1) {
            this.notes.splice(index, 1);
            element.remove();
        }
    }
    
    clearNotes() {
        this.notes = [];
        document.querySelectorAll('.note').forEach(note => note.remove());
    }
    
    exportPattern() {
        if (this.notes.length === 0) {
            alert('No notes to export!');
            return;
        }
        
        const pattern = {
            bpm: this.bpm,
            notes: this.notes.sort((a, b) => a.time - b.time)
        };
        
        const dataStr = JSON.stringify(pattern, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'note-pattern.json';
        link.click();
    }
    
    importPattern() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const pattern = JSON.parse(e.target.result);
                        this.bpm = pattern.bpm || 120;
                        this.bpmInput.value = this.bpm;
                        this.notes = pattern.notes || [];
                        this.clearNotes();
                        this.renderAllNotes();
                    } catch (error) {
                        alert('Error importing pattern: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    renderAllNotes() {
        this.notes.forEach(note => {
            const laneElement = this.lanes[note.lane];
            this.renderNote(note, laneElement);
        });
    }
}

// Initialize the editor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NoteEditor();
}); 