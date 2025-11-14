// Multi-Stage Captcha System
let currentStage = 1;
const totalStages = 5;
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('total-stages').textContent = totalStages;
    initStage1();
    document.getElementById('verifyBtn').addEventListener('click', handleVerify);
});

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
