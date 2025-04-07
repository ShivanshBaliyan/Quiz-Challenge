// Quiz data - Replace with your own questions
const quizData = [
    {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2 // Index of correct answer (Paris)
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        correctAnswer: 1 // Mars
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correctAnswer: 3 // Pacific Ocean
    },
    {
        question: "Which element has the chemical symbol 'O'?",
        options: ["Gold", "Oxygen", "Iron", "Silver"],
        correctAnswer: 1 // Oxygen
    },
    {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
        correctAnswer: 1 // Leonardo da Vinci
    },
    {
        question: "What is the largest mammal on Earth?",
        options: ["Elephant", "Giraffe", "Blue Whale", "Hippopotamus"],
        correctAnswer: 2 // Blue Whale
    },
    {
        question: "Which country is home to the kangaroo?",
        options: ["New Zealand", "South Africa", "Australia", "Brazil"],
        correctAnswer: 2 // Australia
    },
    {
        question: "How many sides does a hexagon have?",
        options: ["Five", "Six", "Seven", "Eight"],
        correctAnswer: 1 // Six
    },
    {
        question: "What is the main ingredient in guacamole?",
        options: ["Avocado", "Tomato", "Onion", "Lime"],
        correctAnswer: 0 // Avocado
    },
    {
        question: "Which famous scientist developed the theory of relativity?",
        options: ["Isaac Newton", "Nikola Tesla", "Albert Einstein", "Marie Curie"],
        correctAnswer: 2 // Albert Einstein
    }
];

// Global variables
let currentQuestion = 0;
let score = 0;
let correctAnswers = 0;
let timeLeft = 30; // seconds per question
let timerInterval;
let quizStartTime;
let quizEndTime;
let selectedAnswer = null;
let isAnswered = false;

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');

const startBtn = document.getElementById('start-btn');
const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
const questionElement = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const timeLeftElement = document.getElementById('time-left');
const currentQuestionElement = document.getElementById('current-question');
const totalQuestionsElement = document.getElementById('total-questions');
const totalQuestionsResultElement = document.getElementById('total-questions-result');
const finalScoreElement = document.getElementById('final-score');
const correctAnswersElement = document.getElementById('correct-answers');
const timeTakenElement = document.getElementById('time-taken');
const playerNameInput = document.getElementById('player-name');
const submitScoreBtn = document.getElementById('submit-score-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
const backBtn = document.getElementById('back-btn');
const leaderboardContainer = document.getElementById('leaderboard-container');
const notification = document.getElementById('notification');

// Initialize the quiz
function initializeQuiz() {
    totalQuestionsElement.textContent = quizData.length;
    totalQuestionsResultElement.textContent = quizData.length;
    
    // Event listeners
    startBtn.addEventListener('click', startQuiz);
    showLeaderboardBtn.addEventListener('click', showLeaderboard);
    nextBtn.addEventListener('click', handleNextQuestion);
    submitScoreBtn.addEventListener('click', submitScore);
    playAgainBtn.addEventListener('click', resetQuiz);
    viewLeaderboardBtn.addEventListener('click', showLeaderboard);
    backBtn.addEventListener('click', showWelcomeScreen);
    playerNameInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            submitScore();
        }
    });
}

// Start the quiz
function startQuiz() {
    currentQuestion = 0;
    score = 0;
    correctAnswers = 0;
    quizStartTime = new Date();
    
    showScreen(quizScreen);
    loadQuestion();
}

// Load current question
function loadQuestion() {
    // Reset state for new question
    isAnswered = false;
    selectedAnswer = null;
    nextBtn.disabled = true;
    
    // Update question counter
    currentQuestionElement.textContent = currentQuestion + 1;
    
    // Clear previous question's options
    optionsContainer.innerHTML = '';
    
    // Set current question
    const currentQuizData = quizData[currentQuestion];
    questionElement.textContent = currentQuizData.question;
    
    // Create options
    currentQuizData.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.innerHTML = `
            <div class="option-marker">${String.fromCharCode(65 + index)}</div>
            <div class="option-text">${option}</div>
        `;
        optionElement.addEventListener('click', () => selectOption(optionElement, index));
        optionsContainer.appendChild(optionElement);
    });
    
    // Reset and start timer
    resetTimer();
    startTimer();
}

// Select an option
function selectOption(optionElement, optionIndex) {
    if (isAnswered) return;
    
    // Clear previous selection
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Set new selection
    optionElement.classList.add('selected');
    selectedAnswer = optionIndex;
    nextBtn.disabled = false;
}

// Handle next question button
function handleNextQuestion() {
    if (selectedAnswer === null) return;
    
    checkAnswer();
    
    // Stop the timer
    clearInterval(timerInterval);
    
    // Show the correct answer
    showCorrectAnswer();
    
    // Delay before moving to next question
    setTimeout(() => {
        currentQuestion++;
        
        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            finishQuiz();
        }
    }, 1500);
}

// Check if the selected answer is correct
function checkAnswer() {
    isAnswered = true;
    const currentQuizData = quizData[currentQuestion];
    
    if (selectedAnswer === currentQuizData.correctAnswer) {
        correctAnswers++;
        
        // Calculate time-based score: max 100 points per question
        // The faster the answer, the higher the score
        const timeBonus = Math.floor((timeLeft / 30) * 50); // Up to 50 bonus points based on time
        const questionScore = 50 + timeBonus; // Base 50 points + time bonus
        
        score += questionScore;
    }
}

// Show the correct answer
function showCorrectAnswer() {
    const options = document.querySelectorAll('.option');
    const currentQuizData = quizData[currentQuestion];
    
    options.forEach((option, index) => {
        if (index === currentQuizData.correctAnswer) {
            option.classList.add('correct');
        } else if (index === selectedAnswer && selectedAnswer !== currentQuizData.correctAnswer) {
            option.classList.add('incorrect');
        }
    });
}

// Start the timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftElement.textContent = timeLeft;
        
        // Update timer appearance based on time left
        const timerElement = document.querySelector('.timer');
        if (timeLeft <= 10) {
            timerElement.classList.add('warning');
        }
        if (timeLeft <= 5) {
            timerElement.classList.remove('warning');
            timerElement.classList.add('danger');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!isAnswered) {
                selectedAnswer = null; // No answer selected
                showCorrectAnswer();
                
                setTimeout(() => {
                    currentQuestion++;
                    if (currentQuestion < quizData.length) {
                        loadQuestion();
                    } else {
                        finishQuiz();
                    }
                }, 1500);
            }
        }
    }, 1000);
}

// Reset timer
function resetTimer() {
    timeLeft = 30;
    timeLeftElement.textContent = timeLeft;
    const timerElement = document.querySelector('.timer');
    timerElement.classList.remove('warning', 'danger');
}

// Finish the quiz
function finishQuiz() {
    quizEndTime = new Date();
    const timeTaken = Math.floor((quizEndTime - quizStartTime) / 1000); // in seconds
    
    // Update result screen
    finalScoreElement.textContent = score;
    correctAnswersElement.textContent = correctAnswers;
    timeTakenElement.textContent = timeTaken;
    
    showScreen(resultScreen);
}

// Submit score to leaderboard
function submitScore() {
    const playerName = playerNameInput.value.trim();
    
    if (!playerName) {
        showNotification('Please enter your name!', 'error');
        return;
    }
    
    const scoreData = {
        name: playerName,
        score: score,
        correctAnswers: correctAnswers,
        timeTaken: Math.floor((quizEndTime - quizStartTime) / 1000)
    };
    
    // Submit score using fetch API
    fetch('https://quiz-challenge.wuaze.com/submit_score.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Score submitted successfully!', 'success');
            playerNameInput.value = '';
            showLeaderboard();
        } else {
            showNotification(data.message || 'Failed to submit score.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('An error occurred while submitting score.', 'error');
    });
}

// Show leaderboard
function showLeaderboard() {
    showScreen(leaderboardScreen);
    
    // Show loading state
    leaderboardContainer.innerHTML = '<div class="loader"></div>';
    
    // Fetch leaderboard data
    fetch('https://quiz-challenge.wuaze.com/leaderboard.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayLeaderboard(data.leaderboard);
            } else {
                leaderboardContainer.innerHTML = `<p>Failed to load leaderboard: ${data.message}</p>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            leaderboardContainer.innerHTML = '<p>An error occurred while loading the leaderboard.</p>';
        });
}

// Display leaderboard data
function displayLeaderboard(leaderboardData) {
    if (!leaderboardData || leaderboardData.length === 0) {
        leaderboardContainer.innerHTML = '<p>No scores recorded yet. Be the first one!</p>';
        return;
    }
    
    let leaderboardHTML = '';
    
    leaderboardData.forEach((entry, index) => {
        leaderboardHTML += `
            <div class="leaderboard-entry">
                <div class="rank rank-${index + 1}">${index + 1}</div>
                <div class="player-name">${entry.name}</div>
                <div class="player-score">${entry.score}</div>
            </div>
        `;
    });
    
    leaderboardContainer.innerHTML = leaderboardHTML;
}

// Reset quiz to start again
function resetQuiz() {
    currentQuestion = 0;
    score = 0;
    correctAnswers = 0;
    startQuiz();
}

// Helper functions
function showScreen(screen) {
    // Hide all screens
    welcomeScreen.classList.remove('active');
    quizScreen.classList.remove('active');
    resultScreen.classList.remove('active');
    leaderboardScreen.classList.remove('active');
    
    // Show the requested screen
    screen.classList.add('active');
}

function showWelcomeScreen() {
    showScreen(welcomeScreen);
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} visible`;
    
    setTimeout(() => {
        notification.classList.remove('visible');
    }, 3000);
}

// Initialize the quiz when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeQuiz);