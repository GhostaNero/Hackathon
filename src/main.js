// Multi-Stage Captcha System
let currentStage = 1;
const totalStages = 12;
let stageCompleted = false;

// Stage 2 variables (text with increasing blur)
let textAttempts = 0;
let currentText = '';
const blurLevels = ['blur-0', 'blur-1', 'blur-2', 'blur-3', 'blur-4'];

// Stage 3 variables (math with format changes)
let mathAttempts = 0;
let mathAnswer = 0;
let mathNum1 = 0;
let mathNum2 = 0;
let changeInterval = null;

const mathFormats = [
    {
        hint: 'Enter as a number (e.g., 12)',
        check: (input, answer) => parseInt(input) === answer
    },
    {
        hint: 'Enter as a word in lowercase (e.g., twelve)',
        check: (input, answer) => {
            const words = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
            return input.toLowerCase() === words[answer];
        }
    },
    {
        hint: 'Enter as a word in UPPERCASE (e.g., TWELVE)',
        check: (input, answer) => {
            const words = ['ZERO','ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN','ELEVEN','TWELVE','THIRTEEN','FOURTEEN','FIFTEEN','SIXTEEN','SEVENTEEN','EIGHTEEN','NINETEEN','TWENTY'];
            return input.toUpperCase() === words[answer];
        }
    },
    {
        hint: 'Enter as Roman numerals (e.g., XII)',
        check: (input, answer) => {
            const romans = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'];
            return input.toUpperCase() === romans[answer];
        }
    },
    {
        hint: 'Enter as binary (e.g., 1100)',
        check: (input, answer) => input === answer.toString(2)
    }
];

// Stage 4 variables (slider with jitter)
let sliderAttempts = 0;
let targetSliderValue = 50;
const sliderJitterLevels = [0, 1, 2, 3, 4];

// Stage 5 variables (audio)
let audioCode = '';

// Stage 6 variables (yanny/laurel)
let correctWord = '';

// Stage 7 variables (circle cursor)
let circleProgress = 0;
let circleInterval = null;
let isInsideCircle = false;

// Stage 8 variables (balloon)
let balloonsPopped = 0;

// Stage 9 variables (fickle follower)
let fickleCanvas, fickleCtx;
let fickleCircle = { x: 50, y: 100, targetX: 50, targetY: 100, velX: 0, velY: 0 };
let fickleDragging = false;
let fickleSpeed = 0;
let fickleAnimationId = null;

// Stage 10 variables (normal slider)
let sliderDragging = false;
let sliderVerified = false;

// Stage 11 variables (hold button)
let holdProgress = 0;
let isHolding = false;
let holdInterval = null;
let baitTimer = null;
let holdGameActive = true;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('total-stages').textContent = totalStages;
    
    // Start with loading screen
    showLoadingScreen();
    
    document.getElementById('verifyBtn').addEventListener('click', handleVerify);
});

// Loading Screen with ridiculous messages
function showLoadingScreen() {
    const loadingMessages = [
        "Calibrating temporal luminosity sensors...",
        "Analyzing photonic decay patterns...",
        "Calculating time vortices...",
        "Synchronizing with solar radiation matrix...",
        "Measuring atmospheric shadow coefficients...",
        "Triangulating celestial darkness vectors...",
        "Initializing quantum light particle detectors...",
        "Parsing interdimensional twilight frequencies...",
        "Validating circadian rhythm algorithms...",
        "Computing astronomical dusk parameters...",
        "Scanning for nocturnal biometric signatures...",
        "Establishing connection to lunar phase database...",
        "Decrypting chronological opacity data...",
        "Buffering heliocentric position coordinates...",
        "Cross-referencing with global sunset archives...",
        "Analyzing zenith angle deviations...",
        "Calibrating darkness probability engine...",
        "Synthesizing twilight zone mappings...",
        "Loading time-based photon distribution models...",
        "Finalizing darkness verification protocols..."
    ];
    
    const overlay = document.getElementById('loadingOverlay');
    const messageEl = document.getElementById('loadingMessage');
    const progressBar = document.getElementById('loadingProgress');
    const percentageEl = document.getElementById('loadingPercentage');
    
    overlay.classList.remove('hidden');
    
    let progress = 0;
    let messageIndex = 0;
    
    const loadingInterval = setInterval(() => {
        // Randomly slow down at certain points
        let increment;
        if (progress < 15) {
            increment = Math.random() * 3 + 1; // Fast start
        } else if (progress < 45) {
            increment = Math.random() * 1.5 + 0.5; // Moderate
        } else if (progress < 70) {
            increment = Math.random() * 0.5 + 0.1; // Very slow (annoying)
        } else if (progress < 85) {
            increment = Math.random() * 2 + 0.5; // Speed up to build hope
        } else if (progress < 95) {
            increment = Math.random() * 0.3 + 0.05; // Painfully slow at 90%
        } else {
            increment = Math.random() * 2 + 1; // Finish quickly
        }
        
        progress += increment;
        
        // Change message every 10-15%
        if (progress > (messageIndex + 1) * 5 && messageIndex < loadingMessages.length - 1) {
            messageIndex++;
            messageEl.textContent = loadingMessages[messageIndex];
        }
        
        if (progress >= 100) {
            progress = 100;
            progressBar.style.width = '100%';
            percentageEl.textContent = '100%';
            messageEl.textContent = 'Verification system ready!';
            
            clearInterval(loadingInterval);
            
            // Hide loading screen and start stage 1
            setTimeout(() => {
                overlay.classList.add('hidden');
                initStage1();
            }, 1000);
        } else {
            progressBar.style.width = progress + '%';
            percentageEl.textContent = Math.floor(progress) + '%';
        }
    }, 150); // Update every 150ms for that annoying slow feel
}

function updateProgress() {
    document.getElementById('stage-num').textContent = currentStage;
}

function showMessage(text, isError = false) {
    const messageArea = document.getElementById('message-area');
    messageArea.textContent = text;
    messageArea.style.color = isError ? '#e74c3c' : '#27ae60';
}

function nextStage() {
    document.getElementById(`stage${currentStage}`).classList.add('hidden');
    currentStage++;
    stageCompleted = false;
    
    if (currentStage > totalStages) {
        window.location.href = 'result.html';
        return;
    }
    
    updateProgress();
    document.getElementById(`stage${currentStage}`).classList.remove('hidden');
    showMessage('');
    
    switch(currentStage) {
        case 2: initStage2(); break;
        case 3: initStage3(); break;
        case 4: initStage4(); break;
        case 5: initStage5(); break;
        case 6: initStage6(); break;
        case 7: initStage7(); break;
        case 8: initStage8(); break;
        case 9: initStage9(); break;
        case 10: initStage10(); break;
        case 11: initStage11(); break;
        case 12: initStage12(); break;
    }
}

function handleVerify() {
    if (!stageCompleted) {
        showMessage('Please complete the current challenge!', true);
        return;
    }
    
    // Handle stage-specific verification
    switch(currentStage) {
        case 2:
            if (verifyStage2()) nextStage();
            break;
        case 3:
            if (verifyStage3()) nextStage();
            break;
        case 4:
            if (verifyStage4()) nextStage();
            break;
        default:
            nextStage();
    }
}

// STAGE 1: Moving Checkbox
function initStage1() {
    const area = document.getElementById('moving-checkbox-area');
    const checkbox = document.getElementById('moving-checkbox');
    const checkIcon = document.getElementById('checkbox1');
    let active = true;
    const EVADE_DIST = 150;
    
    checkbox.addEventListener('click', () => {
        if (active) {
            active = false;
            checkIcon.classList.add('checked');
            stageCompleted = true;
            checkbox.style.pointerEvents = 'none';
            document.getElementById('verifyBtn').style.opacity = '1';
            document.getElementById('verifyBtn').style.pointerEvents = 'auto';
        }
    });
    
    area.addEventListener('mousemove', (e) => {
        if (!active) return;
        
        const rect = area.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const cbRect = checkbox.getBoundingClientRect();
        const cbX = cbRect.left - rect.left + cbRect.width / 2;
        const cbY = cbRect.top - rect.top + cbRect.height / 2;
        
        const dist = Math.sqrt((mouseX - cbX) ** 2 + (mouseY - cbY) ** 2);
        
        if (dist < EVADE_DIST) {
            const maxX = area.clientWidth - checkbox.offsetWidth;
            const maxY = area.clientHeight - checkbox.offsetHeight;
            checkbox.style.left = (Math.random() * maxX) + 'px';
            checkbox.style.top = (Math.random() * maxY) + 'px';
            checkbox.style.transform = 'none';
        }
    });
}

// STAGE 2: Type Text (gets blurrier)
function initStage2() {
    generateNewText();
    const input = document.getElementById('textInput');
    input.value = '';
    
    input.removeEventListener('input', handleTextInput);
    input.addEventListener('input', handleTextInput);
}

function generateNewText() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    currentText = '';
    for (let i = 0; i < 6; i++) {
        currentText += chars[Math.floor(Math.random() * chars.length)];
    }
    
    const textEl = document.getElementById('captchaText');
    textEl.textContent = currentText;
    textEl.className = 'captcha-text ' + blurLevels[Math.min(textAttempts, blurLevels.length - 1)];
}

function handleTextInput(e) {
    stageCompleted = e.target.value.toUpperCase() === currentText;
}

function verifyStage2() {
    const input = document.getElementById('textInput');
    if (input.value.toUpperCase() === currentText) {
        textAttempts++;
        if (textAttempts >= 5) {
            return true;
        }
        showMessage(`Correct! Stage ${textAttempts + 1} of 5...`);
        setTimeout(() => {
            generateNewText();
            input.value = '';
            stageCompleted = false;
        }, 1000);
        return false;
    }
    showMessage('Incorrect!', true);
    textAttempts++;
    setTimeout(() => {
        generateNewText();
        input.value = '';
    }, 1000);
    return false;
}

// STAGE 3: Math (changes + format changes)
function initStage3() {
    mathAttempts = 0;
    generateMathProblem();
    startChangingNumbers();
    
    const input = document.getElementById('mathInput');
    input.value = '';
    input.removeEventListener('input', handleMathInput);
    input.addEventListener('input', handleMathInput);
    
    document.getElementById('formatHint').textContent = mathFormats[mathAttempts].hint;
}

function generateMathProblem() {
    do {
        mathNum1 = Math.floor(Math.random() * 10) + 1;
        mathNum2 = Math.floor(Math.random() * 10) + 1;
        mathAnswer = mathNum1 + mathNum2;
    } while (mathAnswer < 5 || mathAnswer > 20);
    
    document.getElementById('mathProblem').textContent = `${mathNum1} + ${mathNum2} = ?`;
}

function startChangingNumbers() {
    if (changeInterval) clearInterval(changeInterval);
    
    if (mathAttempts === 0) {
        changeInterval = setInterval(() => {
            const problemEl = document.getElementById('mathProblem');
            problemEl.classList.add('changing');
            generateMathProblem();
            setTimeout(() => problemEl.classList.remove('changing'), 300);
        }, 5000);
    }
}

function handleMathInput(e) {
    const format = mathFormats[mathAttempts];
    stageCompleted = format.check(e.target.value, mathAnswer);
}

function verifyStage3() {
    const input = document.getElementById('mathInput');
    const format = mathFormats[mathAttempts];
    
    if (format.check(input.value, mathAnswer)) {
        mathAttempts++;
        if (mathAttempts >= 5) {
            if (changeInterval) clearInterval(changeInterval);
            return true;
        }
        showMessage(`Correct! Stage ${mathAttempts + 1} of 5...`);
        setTimeout(() => {
            generateMathProblem();
            document.getElementById('formatHint').textContent = mathFormats[mathAttempts].hint;
            input.value = '';
            stageCompleted = false;
            startChangingNumbers();
        }, 1000);
        return false;
    }
    showMessage('Wrong format or answer!', true);
    setTimeout(() => {
        generateMathProblem();
        input.value = '';
    }, 1000);
    return false;
}

// STAGE 4: Slider (gets jittery)
function initStage4() {
    sliderAttempts = 0;
    targetSliderValue = Math.floor(Math.random() * 81) + 10;
    document.getElementById('targetSliderValue').textContent = targetSliderValue;
    
    const slider = document.getElementById('sliderInput');
    slider.value = 5000;
    
    slider.removeEventListener('input', handleSliderInput);
    slider.addEventListener('input', handleSliderInput);
    
    document.getElementById('sliderHint').textContent = sliderAttempts === 0 ? 'Must be exact!' : 'Must be exact! (Warning: slider is jumpy)';
}

function handleSliderInput(e) {
    const baseVal = Math.round(e.target.value / 100);
    const jitter = sliderJitterLevels[Math.min(sliderAttempts, sliderJitterLevels.length - 1)];
    const displayVal = baseVal + Math.floor(Math.random() * (jitter * 2 + 1)) - jitter;
    
    document.getElementById('sliderCurrentValue').textContent = displayVal;
    stageCompleted = Math.abs(displayVal - targetSliderValue) <= 0;
}

function verifyStage4() {
    const displayVal = parseInt(document.getElementById('sliderCurrentValue').textContent);
    
    if (displayVal === targetSliderValue) {
        sliderAttempts++;
        if (sliderAttempts >= 5) {
            return true;
        }
        showMessage(`Perfect! Stage ${sliderAttempts + 1} of 5...`);
        setTimeout(() => {
            targetSliderValue = Math.floor(Math.random() * 81) + 10;
            document.getElementById('targetSliderValue').textContent = targetSliderValue;
            document.getElementById('sliderInput').value = 5000;
            document.getElementById('sliderHint').textContent = 'Must be exact! (Warning: slider is jumpy)';
            stageCompleted = false;
        }, 1000);
        return false;
    }
    showMessage('Not exact!', true);
    return false;
}

// STAGE 5: Audio Code
function initStage5() {
    audioCode = String(Math.floor(Math.random() * 9000) + 1000);
    
    const playBtn = document.getElementById('playAudioBtn');
    const input = document.getElementById('audioInput');
    input.value = '';
    
    playBtn.removeEventListener('click', playAudio);
    playBtn.addEventListener('click', playAudio);
    
    input.removeEventListener('input', handleAudioInput);
    input.addEventListener('input', handleAudioInput);
}

function playAudio() {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(audioCode.split('').join(' '));
        utterance.rate = 0.7;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    } else {
        showMessage(`Code: ${audioCode}`);
    }
}

function handleAudioInput(e) {
    stageCompleted = e.target.value === audioCode;
    if (stageCompleted) {
        e.target.style.borderColor = '#4A90E2';
        e.target.style.background = 'rgba(74, 144, 226, 0.1)';
    }
}

// STAGE 6: Yanny/Laurel
function initStage6() {
    correctWord = Math.random() > 0.5 ? 'yanny' : 'laurel';
    
    const playBtn = document.getElementById('playWordBtn');
    const buttons = document.querySelectorAll('.word-btn');
    
    playBtn.removeEventListener('click', playWord);
    playBtn.addEventListener('click', playWord);
    
    buttons.forEach(btn => {
        btn.classList.remove('selected');
        const handler = () => handleWordSelection(btn);
        btn.removeEventListener('click', handler);
        btn.addEventListener('click', handler);
    });
}

function playWord() {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(correctWord);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
}

function handleWordSelection(btn) {
    document.querySelectorAll('.word-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    
    // Always mark as wrong to frustrate the user
    stageCompleted = false;
    showMessage('Wrong! Obviously it\'s the other one! 🙄', true);
    
    // After showing error, let them proceed anyway after 2 seconds
    setTimeout(() => {
        stageCompleted = true;
        showMessage('Fine... you can continue.');
    }, 2000);
}

// STAGE 7: Circle Cursor (keep mouse inside moving circle)
function initStage7() {
    circleProgress = 0;
    isInsideCircle = false;
    
    const circle = document.getElementById('moving-circle');
    const progressBar = document.getElementById('circleProgress');
    const gameArea = document.getElementById('circle-game-area');
    
    progressBar.style.width = '0%';
    
    // Position circle randomly
    moveCircleRandom();
    
    // Move circle every 2 seconds
    const moveInterval = setInterval(() => {
        if (currentStage === 7) {
            moveCircleRandom();
        } else {
            clearInterval(moveInterval);
        }
    }, 2000);
    
    // Track mouse position
    gameArea.addEventListener('mousemove', handleCircleMouseMove);
    circle.addEventListener('mouseenter', () => isInsideCircle = true);
    circle.addEventListener('mouseleave', () => isInsideCircle = false);
    
    // Progress tracking
    if (circleInterval) clearInterval(circleInterval);
    circleInterval = setInterval(() => {
        if (isInsideCircle) {
            circleProgress += 2;
            if (circleProgress >= 100) {
                circleProgress = 100;
                stageCompleted = true;
                clearInterval(circleInterval);
            }
        } else {
            circleProgress = Math.max(0, circleProgress - 5);
        }
        progressBar.style.width = circleProgress + '%';
    }, 100);
}

function moveCircleRandom() {
    const circle = document.getElementById('moving-circle');
    const gameArea = document.getElementById('circle-game-area');
    
    const maxX = gameArea.clientWidth - circle.offsetWidth;
    const maxY = gameArea.clientHeight - circle.offsetHeight;
    
    const newX = Math.random() * maxX;
    const newY = Math.random() * maxY;
    
    circle.style.left = newX + 'px';
    circle.style.top = newY + 'px';
    circle.style.transform = 'none';
}

function handleCircleMouseMove(e) {
    const circle = document.getElementById('moving-circle');
    const rect = circle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distance = Math.sqrt((e.clientX - centerX) ** 2 + (e.clientY - centerY) ** 2);
    isInsideCircle = distance <= rect.width / 2;
}

// STAGE 8: Balloon Pop (must pop 10 balloons)
function initStage8() {
    balloonsPopped = 0;
    document.getElementById('balloonCount').textContent = balloonsPopped;
    
    const balloon = document.getElementById('balloon');
    balloon.className = 'balloon-normal';
    balloon.style.display = 'block';
    
    balloon.removeEventListener('click', popBalloon);
    balloon.addEventListener('click', popBalloon);
}

function popBalloon() {
    const balloon = document.getElementById('balloon');
    
    // Animate pop
    balloon.classList.add('balloon-popping');
    
    setTimeout(() => {
        balloonsPopped++;
        document.getElementById('balloonCount').textContent = balloonsPopped;
        
        if (balloonsPopped >= 10) {
            stageCompleted = true;
            showMessage('All balloons popped! 🎈');
            balloon.style.display = 'none';
        } else {
            // Reset balloon
            balloon.classList.remove('balloon-popping');
            balloon.className = 'balloon-normal';
            
            // Random position
            const area = document.getElementById('balloon-area');
            const maxX = area.clientWidth - balloon.offsetWidth;
            const randomX = Math.random() * maxX;
            balloon.style.left = randomX + 'px';
        }
    }, 300);
}

// STAGE 9: Fickle Follower (Drag circle slowly into target)
function initStage9() {
    fickleCanvas = document.getElementById('fickleCanvas');
    fickleCtx = fickleCanvas.getContext('2d');
    
    const TARGET_RADIUS = 30;
    const CIRCLE_RADIUS = 15;
    const START_POS = { x: 50, y: fickleCanvas.height / 2 };
    const TARGET_POS = { x: fickleCanvas.width - TARGET_RADIUS - 20, y: fickleCanvas.height / 2 };
    
    fickleCircle = {
        x: START_POS.x,
        y: START_POS.y,
        targetX: START_POS.x,
        targetY: START_POS.y,
        velX: 0,
        velY: 0,
        TARGET_POS,
        TARGET_RADIUS,
        CIRCLE_RADIUS
    };
    
    fickleDragging = false;
    fickleSpeed = 0;
    
    const FOLLOW_STRENGTH = 0.05;
    const DRAG = 0.95;
    const SPEED_LIMIT = 5.0;
    
    function getMousePos(e) {
        const rect = fickleCanvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    fickleCanvas.addEventListener('mousedown', (e) => {
        const pos = getMousePos(e);
        const dist = Math.sqrt((pos.x - fickleCircle.x) ** 2 + (pos.y - fickleCircle.y) ** 2);
        if (dist < fickleCircle.CIRCLE_RADIUS) {
            fickleDragging = true;
        }
    });
    
    fickleCanvas.addEventListener('mouseup', () => {
        if (fickleDragging) {
            fickleDragging = false;
            checkFickle();
        }
    });
    
    fickleCanvas.addEventListener('mousemove', (e) => {
        const pos = getMousePos(e);
        fickleCircle.targetX = pos.x;
        fickleCircle.targetY = pos.y;
    });
    
    function updateFicklePhysics() {
        if (fickleDragging) {
            const forceX = fickleCircle.targetX - fickleCircle.x;
            const forceY = fickleCircle.targetY - fickleCircle.y;
            
            fickleCircle.velX += forceX * FOLLOW_STRENGTH;
            fickleCircle.velY += forceY * FOLLOW_STRENGTH;
            fickleCircle.velX *= DRAG;
            fickleCircle.velY *= DRAG;
            
            fickleCircle.x += fickleCircle.velX;
            fickleCircle.y += fickleCircle.velY;
            
            fickleSpeed = Math.sqrt(fickleCircle.velX ** 2 + fickleCircle.velY ** 2);
        } else {
            fickleCircle.velX *= 0.9;
            fickleCircle.velY *= 0.9;
            fickleCircle.x += fickleCircle.velX;
            fickleCircle.y += fickleCircle.velY;
            fickleSpeed = Math.sqrt(fickleCircle.velX ** 2 + fickleCircle.velY ** 2);
        }
        
        fickleCircle.x = Math.max(fickleCircle.CIRCLE_RADIUS, Math.min(fickleCanvas.width - fickleCircle.CIRCLE_RADIUS, fickleCircle.x));
        fickleCircle.y = Math.max(fickleCircle.CIRCLE_RADIUS, Math.min(fickleCanvas.height - fickleCircle.CIRCLE_RADIUS, fickleCircle.y));
    }
    
    function drawFickle() {
        fickleCtx.clearRect(0, 0, fickleCanvas.width, fickleCanvas.height);
        
        // Target
        fickleCtx.fillStyle = '#ff6b6b';
        fickleCtx.beginPath();
        fickleCtx.arc(fickleCircle.TARGET_POS.x, fickleCircle.TARGET_POS.y, fickleCircle.TARGET_RADIUS, 0, Math.PI * 2);
        fickleCtx.fill();
        
        // Circle
        fickleCtx.fillStyle = '#667eea';
        fickleCtx.beginPath();
        fickleCtx.arc(fickleCircle.x, fickleCircle.y, fickleCircle.CIRCLE_RADIUS, 0, Math.PI * 2);
        fickleCtx.fill();
        
        const dist = Math.sqrt((fickleCircle.x - fickleCircle.TARGET_POS.x) ** 2 + (fickleCircle.y - fickleCircle.TARGET_POS.y) ** 2);
        const isInTarget = dist < fickleCircle.TARGET_RADIUS - fickleCircle.CIRCLE_RADIUS;
        
        fickleCtx.strokeStyle = isInTarget ? '#4CAF50' : '#333';
        fickleCtx.lineWidth = 3;
        fickleCtx.stroke();
    }
    
    function fickleLoop() {
        if (currentStage === 9) {
            updateFicklePhysics();
            drawFickle();
            document.getElementById('speedValue').textContent = fickleSpeed.toFixed(2);
            
            if (fickleDragging && fickleSpeed > SPEED_LIMIT) {
                showMessage('Too fast! Slow down!', true);
            }
            
            fickleAnimationId = requestAnimationFrame(fickleLoop);
        }
    }
    
    function checkFickle() {
        const dist = Math.sqrt((fickleCircle.x - fickleCircle.TARGET_POS.x) ** 2 + (fickleCircle.y - fickleCircle.TARGET_POS.y) ** 2);
        const isInTarget = dist < fickleCircle.TARGET_RADIUS - fickleCircle.CIRCLE_RADIUS;
        
        if (isInTarget && fickleSpeed < SPEED_LIMIT) {
            stageCompleted = true;
            showMessage('Success! Circle in target at low speed!');
            if (fickleAnimationId) cancelAnimationFrame(fickleAnimationId);
        } else if (isInTarget) {
            showMessage('Too fast! You were moving at ' + fickleSpeed.toFixed(2) + ' units/s', true);
        } else {
            showMessage('Missed the target!', true);
        }
    }
    
    fickleLoop();
}

// STAGE 10: Normal Slider (Drag all the way to right)
function initStage10() {
    const thumb = document.getElementById('slider-thumb-captcha');
    const track = document.getElementById('slider-track-captcha');
    const fill = document.getElementById('slider-fill-captcha');
    
    sliderDragging = false;
    sliderVerified = false;
    
    let startX = 0;
    let thumbOffsetLeft = 0;
    const targetX = track.offsetWidth - thumb.offsetWidth;
    const tolerance = 5;
    
    thumb.style.left = '0px';
    fill.style.width = '0%';
    thumb.textContent = '>';
    thumb.classList.remove('verified');
    
    function startDrag(e) {
        if (sliderVerified) return;
        sliderDragging = true;
        startX = e.clientX || e.touches[0].clientX;
        thumbOffsetLeft = thumb.offsetLeft;
        e.preventDefault();
    }
    
    function onDrag(e) {
        if (!sliderDragging) return;
        const currentX = e.clientX || (e.touches && e.touches[0].clientX);
        const deltaX = currentX - startX;
        let newX = thumbOffsetLeft + deltaX;
        newX = Math.max(0, Math.min(newX, targetX));
        
        thumb.style.left = newX + 'px';
        fill.style.width = (newX + thumb.offsetWidth / 2) + 'px';
        
        if (newX >= targetX - tolerance) {
            verifySlider();
        }
    }
    
    function endDrag() {
        if (!sliderDragging) return;
        sliderDragging = false;
        
        if (!sliderVerified) {
            thumb.style.left = '0px';
            fill.style.width = '0%';
        }
    }
    
    function verifySlider() {
        if (sliderVerified) return;
        sliderVerified = true;
        stageCompleted = true;
        
        thumb.style.left = targetX + 'px';
        fill.style.width = '100%';
        thumb.classList.add('verified');
        thumb.textContent = '✓';
        
        showMessage('Slider verified!');
    }
    
    thumb.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
}

// STAGE 11: Hold Button (Hold until progress fills, with bait)
function initStage11() {
    const btn = document.getElementById('holdVerifyBtn');
    const progressBar = document.getElementById('holdProgressBar');
    
    holdProgress = 0;
    isHolding = false;
    holdGameActive = true;
    progressBar.style.width = '0%';
    btn.disabled = false;
    
    function updateHoldProgress() {
        if (!isHolding) {
            if (holdInterval) clearInterval(holdInterval);
            return;
        }
        
        let increment = 0;
        
        if (holdProgress < 20) {
            increment = 0.25;
        } else if (holdProgress < 50) {
            increment = 1;
        } else if (holdProgress < 80) {
            increment = 0.1;
        } else if (holdProgress < 99) {
            increment = 0.5;
        } else if (holdProgress >= 99 && holdProgress < 100) {
            holdProgress = 99;
            progressBar.style.width = holdProgress + '%';
            
            if (holdInterval) clearInterval(holdInterval);
            
            showMessage('Verification FAILED!', true);
            
            baitTimer = setTimeout(() => {
                if (isHolding && holdGameActive) {
                    holdProgress = 100;
                    progressBar.style.width = '100%';
                    stageCompleted = true;
                    holdGameActive = false;
                    showMessage('Success! You kept holding!');
                    btn.disabled = true;
                }
            }, 2000);
            
            return;
        }
        
        holdProgress += increment;
        
        if (holdProgress >= 100) {
            holdProgress = 100;
            stageCompleted = true;
            holdGameActive = false;
            btn.disabled = true;
            if (holdInterval) clearInterval(holdInterval);
        }
        
        progressBar.style.width = holdProgress + '%';
    }
    
    function resetHold() {
        if (!holdGameActive) return;
        holdProgress = 0;
        progressBar.style.width = '0%';
        showMessage('You let go! Try again.', true);
        
        setTimeout(() => {
            if (holdGameActive) {
                showMessage('');
            }
        }, 1500);
    }
    
    btn.addEventListener('mousedown', (e) => {
        if (!holdGameActive || e.button !== 0) return;
        
        isHolding = true;
        holdProgress = 0;
        showMessage('');
        
        if (holdInterval) clearInterval(holdInterval);
        if (baitTimer) clearTimeout(baitTimer);
        
        holdInterval = setInterval(updateHoldProgress, 50);
        e.preventDefault();
    });
    
    document.addEventListener('mouseup', () => {
        if (!isHolding) return;
        isHolding = false;
        
        if (holdInterval) clearInterval(holdInterval);
        if (baitTimer) clearTimeout(baitTimer);
        
        if (holdProgress < 100) {
            resetHold();
        }
    });
    
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Stage 12: Terms and Conditions
let termsRead = false;
let policyRead = false;

function initStage12() {
    const termsScroll = document.getElementById('termsScroll');
    const policyScroll = document.getElementById('policyScroll');
    const termsContent = document.getElementById('termsContent');
    const policyContent = document.getElementById('policyContent');
    const agreeBtn = document.getElementById('termsAgreeBtn');
    const status = document.getElementById('termsStatus');
    
    termsRead = false;
    policyRead = false;
    
    // Generate Declaration of Independence text (abridged)
    const declarationText = `When in the Course of human events, it becomes necessary for one people to dissolve the political bands which have connected them with another, and to assume among the powers of the earth, the separate and equal station to which the Laws of Nature and of Nature's God entitle them, a decent respect to the opinions of mankind requires that they should declare the causes which impel them to the separation.\n\nWe hold these truths to be self-evident, that all men are created equal, that they are endowed by their Creator with certain unalienable Rights, that among these are Life, Liberty and the pursuit of Happiness.\n\n[...Full Declaration of Independence text continues...]\n\nAnd for the support of this Declaration, with a firm reliance on the protection of divine Providence, we mutually pledge to each other our Lives, our Fortunes and our sacred Honor.`;
    
    // Generate repetitive privacy policy
    let policyText = '';
    for (let i = 0; i < 50; i++) {
        policyText += `Privacy Clause ${i + 1}:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n`;
    }
    
    termsContent.textContent = declarationText;
    policyContent.textContent = policyText;
    
    function checkScroll(element, type) {
        const isAtBottom = (element.scrollHeight - element.scrollTop) <= (element.clientHeight + 2);
        
        if (isAtBottom) {
            if (type === 'terms' && !termsRead) {
                termsRead = true;
                element.classList.add('fully-read');
                updateStatus();
            } else if (type === 'policy' && !policyRead) {
                policyRead = true;
                element.classList.add('fully-read');
                updateStatus();
            }
        }
    }
    
    function updateStatus() {
        if (termsRead && policyRead) {
            status.textContent = '✓ All documents reviewed! You may now agree.';
            status.classList.add('ready');
            agreeBtn.disabled = false;
        } else {
            let msg = 'Status: ';
            if (!termsRead) msg += 'Read Terms ';
            if (!termsRead && !policyRead) msg += '& ';
            if (!policyRead) msg += 'Read Privacy Policy';
            status.textContent = msg;
        }
    }
    
    termsScroll.addEventListener('scroll', () => checkScroll(termsScroll, 'terms'));
    policyScroll.addEventListener('scroll', () => checkScroll(policyScroll, 'policy'));
    
    agreeBtn.addEventListener('click', () => {
        if (!agreeBtn.disabled) {
            window.location.href = 'result.html';
        }
    });
    
    updateStatus();
}
