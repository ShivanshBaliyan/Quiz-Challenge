<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for JSON response
header('Content-Type: application/json');

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are allowed.'
    ]);
    exit;
}

// Get JSON data from the request
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

// Validate the data
if (!$data || !isset($data['name']) || !isset($data['score'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid data format. Name and score are required.'
    ]);
    exit;
}

// Sanitize inputs
$name = htmlspecialchars(trim($data['name']));
$score = (int) $data['score'];
$correctAnswers = isset($data['correctAnswers']) ? (int) $data['correctAnswers'] : 0;
$timeTaken = isset($data['timeTaken']) ? (int) $data['timeTaken'] : 0;

// Basic validation
if (empty($name) || strlen($name) > 50 || $score < 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid input data.'
    ]);
    exit;
}

// Directory for scores
$scoresDir = 'scores';

// Create scores directory if it doesn't exist
if (!is_dir($scoresDir)) {
    if (!mkdir($scoresDir, 0777, true)) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create scores directory.'
        ]);
        exit;
    }
    chmod($scoresDir, 0777);
}

// Create a unique filename for this score
$filename = $scoresDir . '/' . time() . '_' . md5($name . $score . mt_rand(1000, 9999)) . '.json';

// Create score data
$scoreData = [
    'name' => $name,
    'score' => $score,
    'correctAnswers' => $correctAnswers,
    'timeTaken' => $timeTaken,
    'timestamp' => time()
];

// Save the score
if (file_put_contents($filename, json_encode($scoreData)) === false) {
    $error = error_get_last();
    echo json_encode([
        'success' => false,
        'message' => 'Failed to save score. Error: ' . ($error ? $error['message'] : 'Unknown error')
    ]);
    exit;
}

// Also update leaderboard.json
$leaderboardFile = 'leaderboard.json';
$existingData = [];

if (file_exists($leaderboardFile)) {
    $existingData = json_decode(file_get_contents($leaderboardFile), true);
    if (!is_array($existingData)) {
        $existingData = [];
    }
}

// Append the new score
$existingData[] = $scoreData;

// Save updated leaderboard
file_put_contents($leaderboardFile, json_encode($existingData));

echo json_encode([
    'success' => true,
    'message' => 'Score submitted successfully!'
]);