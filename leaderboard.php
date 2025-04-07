<?php
// Set headers for JSON response
header('Content-Type: application/json');

// Handle CORS (if needed)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// File to store leaderboard data
$leaderboardFile = 'leaderboard.json';

// Load leaderboard data
if (file_exists($leaderboardFile)) {
    $leaderboardData = file_get_contents($leaderboardFile);
    
    if ($leaderboardData) {
        $leaderboard = json_decode($leaderboardData, true);
        
        if (is_array($leaderboard)) {
            // Sort by score (descending) - just to be sure
            usort($leaderboard, function($a, $b) {
                return $b['score'] - $a['score'];
            });
            
            // Return leaderboard data
            echo json_encode([
                'success' => true,
                'leaderboard' => $leaderboard
            ]);
            exit;
        }
    }
}

// If file doesn't exist or is empty/invalid
echo json_encode([
    'success' => true,
    'leaderboard' => []
]);