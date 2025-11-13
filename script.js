// Game state
let sadFaces = [];
let happyCount = 0;
const totalFaces = 10;
let confettiAnimation = null;
let confettiRunning = false;

// Initialize game
function initGame() {
    const container = document.getElementById('faces-container');
    const victoryScreen = document.getElementById('victory-screen');
    
    // Reset state
    container.innerHTML = '';
    victoryScreen.classList.add('hidden');
    sadFaces = [];
    happyCount = 0;
    
    // Stop any existing confetti
    confettiRunning = false;
    if (confettiAnimation) {
        cancelAnimationFrame(confettiAnimation);
        confettiAnimation = null;
    }
    
    // Create 10 sad faces at random positions
    const existingPositions = [];
    for (let i = 0; i < totalFaces; i++) {
        createSadFace(container, existingPositions);
    }
}

// Check if two rectangles overlap
function checkOverlap(x1, y1, x2, y2, size) {
    return !(x1 + size < x2 || x2 + size < x1 || y1 + size < y2 || y2 + size < y1);
}

// Create a sad face at a random position that doesn't overlap
function createSadFace(container, existingPositions) {
    const face = document.createElement('div');
    face.className = 'face sad';
    face.textContent = '😞';
    
    const faceSize = 80;
    const padding = 20; // Extra padding between faces
    const maxX = window.innerWidth - faceSize;
    const maxY = window.innerHeight - faceSize;
    
    let x, y;
    let attempts = 0;
    const maxAttempts = 100;
    
    // Try to find a non-overlapping position
    do {
        x = Math.random() * maxX;
        y = Math.random() * maxY;
        attempts++;
        
        // Check if this position overlaps with any existing face
        let overlaps = false;
        for (const pos of existingPositions) {
            if (checkOverlap(x, y, pos.x, pos.y, faceSize + padding)) {
                overlaps = true;
                break;
            }
        }
        
        if (!overlaps) {
            break;
        }
    } while (attempts < maxAttempts);
    
    // Store position for future collision checks
    existingPositions.push({ x, y });
    
    face.style.left = x + 'px';
    face.style.top = y + 'px';
    
    // Double-click handler
    let clickCount = 0;
    let clickTimer = null;
    
    face.addEventListener('click', function(e) {
        e.preventDefault();
        clickCount++;
        
        if (clickCount === 1) {
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 300); // 300ms window for double-click
        } else if (clickCount === 2) {
            clearTimeout(clickTimer);
            clickCount = 0;
            turnToHappy(face);
        }
    });
    
    container.appendChild(face);
    sadFaces.push(face);
}

// Turn a sad face into a happy face
function turnToHappy(face) {
    if (face.classList.contains('happy')) {
        return; // Already happy
    }
    
    face.classList.remove('sad');
    face.classList.add('happy');
    face.textContent = '😊';
    happyCount++;
    
    // Check if all faces are happy
    if (happyCount === totalFaces) {
        setTimeout(() => {
            showVictory();
        }, 500);
    }
}

// Show victory screen with confetti
function showVictory() {
    const victoryScreen = document.getElementById('victory-screen');
    victoryScreen.classList.remove('hidden');
    
    // Start confetti animation
    startConfetti();
    
    // Setup try again button
    const tryAgainBtn = document.getElementById('try-again-btn');
    tryAgainBtn.onclick = initGame;
}

// Confetti animation
function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confetti = [];
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#95e1d3', '#f38181', '#aa96da', '#fcbad3'];
    
    // Create confetti particles
    for (let i = 0; i < 200; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 2,
            d: Math.random() * confetti.length,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncrement: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }
    
    confettiRunning = true;
    
    function animate() {
        if (!confettiRunning) {
            return;
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach((c, i) => {
            ctx.beginPath();
            ctx.lineWidth = c.r;
            ctx.strokeStyle = c.color;
            ctx.moveTo(c.x + c.tilt + c.r, c.y);
            ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r);
            ctx.stroke();
            
            c.tiltAngle += c.tiltAngleIncrement;
            c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
            c.x += Math.sin(c.d);
            c.tilt = Math.sin(c.tiltAngle - i / 3) * 15;
            
            // Reset particle if it goes off screen
            if (c.y > canvas.height) {
                c.x = Math.random() * canvas.width;
                c.y = -20;
                c.tilt = Math.floor(Math.random() * 10) - 10;
            }
        });
        
        confettiAnimation = requestAnimationFrame(animate);
    }
    
    animate();
}

// Handle window resize
window.addEventListener('resize', () => {
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// Start the game when page loads
window.addEventListener('load', initGame);

