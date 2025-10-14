<?php
/**
 * eSports Hub - PHP API Endpoints
 * Simple API endpoints for dynamic content and form handling
 */

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration (example with SQLite)
$dbPath = __DIR__ . '/../data/db.sqlite';

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // If database doesn't exist, create it
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create tables
    createTables($pdo);
}

function createTables($pdo) {
    // Create news table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            content TEXT NOT NULL,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            author TEXT,
            image TEXT
        )
    ");
    
    // Create tournaments table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS tournaments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            game TEXT NOT NULL,
            date DATETIME NOT NULL,
            prize INTEGER NOT NULL,
            status TEXT DEFAULT 'upcoming',
            location TEXT,
            description TEXT
        )
    ");
    
    // Create teams table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            game TEXT NOT NULL,
            region TEXT NOT NULL,
            tier TEXT DEFAULT 'Tier 1',
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // Create players table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            team_id INTEGER,
            game TEXT NOT NULL,
            rank INTEGER,
            kda REAL,
            win_rate REAL,
            FOREIGN KEY (team_id) REFERENCES teams (id)
        )
    ");
    
    // Create contact_messages table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // Create newsletter_subscribers table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // Create tournament_registrations table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS tournament_registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_name TEXT NOT NULL,
            captain TEXT NOT NULL,
            email TEXT NOT NULL,
            experience TEXT NOT NULL,
            additional_info TEXT,
            tournament_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tournament_id) REFERENCES tournaments (id)
        )
    ");
}

// Get the request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Route the request
switch ($method) {
    case 'GET':
        handleGet($path, $pdo);
        break;
    case 'POST':
        handlePost($path, $pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function handleGet($path, $pdo) {
    switch ($path) {
        case '/api/news':
            getNews($pdo);
            break;
        case '/api/tournaments':
            getTournaments($pdo);
            break;
        case '/api/teams':
            getTeams($pdo);
            break;
        case '/api/players':
            getPlayers($pdo);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
    }
}

function handlePost($path, $pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($path) {
        case '/api/contact':
            submitContact($pdo, $input);
            break;
        case '/api/newsletter':
            subscribeNewsletter($pdo, $input);
            break;
        case '/api/tournament-register':
            registerTournament($pdo, $input);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
    }
}

function getNews($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM news ORDER BY date DESC LIMIT 10");
        $news = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // If no news in database, return mock data
        if (empty($news)) {
            $news = [
                [
                    'id' => 1,
                    'title' => 'Championship Finals This Weekend',
                    'category' => 'Tournament',
                    'content' => 'The biggest eSports championship of the year is happening this weekend with a prize pool of $1M.',
                    'date' => '2024-12-15',
                    'author' => 'Sarah Johnson',
                    'image' => 'assets/images/tournaments/tournament-poster.png'
                ]
            ];
        }
        
        echo json_encode($news);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function getTournaments($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM tournaments ORDER BY date ASC");
        $tournaments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // If no tournaments in database, return mock data
        if (empty($tournaments)) {
            $tournaments = [
                [
                    'id' => 1,
                    'name' => 'World Championship 2024',
                    'game' => 'League of Legends',
                    'date' => '2024-12-20',
                    'prize' => 1500000,
                    'status' => 'upcoming',
                    'location' => 'Los Angeles, CA'
                ]
            ];
        }
        
        echo json_encode($tournaments);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function getTeams($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM teams ORDER BY wins DESC");
        $teams = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // If no teams in database, return mock data
        if (empty($teams)) {
            $teams = [
                [
                    'id' => 1,
                    'name' => 'Team Thunder',
                    'game' => 'League of Legends',
                    'region' => 'Europe',
                    'tier' => 'Tier 1',
                    'wins' => 45,
                    'losses' => 12
                ]
            ];
        }
        
        echo json_encode($teams);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function getPlayers($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM players ORDER BY rank ASC");
        $players = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // If no players in database, return mock data
        if (empty($players)) {
            $players = [
                [
                    'id' => 1,
                    'name' => 'Alex Lightning Chen',
                    'team_id' => 1,
                    'game' => 'League of Legends',
                    'rank' => 1,
                    'kda' => 8.2,
                    'win_rate' => 78
                ]
            ];
        }
        
        echo json_encode($players);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function submitContact($pdo, $data) {
    if (!isset($data['name']) || !isset($data['email']) || !isset($data['subject']) || !isset($data['message'])) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields are required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['email'], $data['subject'], $data['message']]);
        
        echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function subscribeNewsletter($pdo, $data) {
    if (!isset($data['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email is required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)");
        $stmt->execute([$data['email']]);
        
        echo json_encode(['success' => true, 'message' => 'Successfully subscribed to newsletter']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function registerTournament($pdo, $data) {
    $required = ['teamName', 'captain', 'email', 'experience'];
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => 'All required fields must be filled']);
            return;
        }
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO tournament_registrations (team_name, captain, email, experience, additional_info) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['teamName'],
            $data['captain'],
            $data['email'],
            $data['experience'],
            $data['info'] ?? null
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Registration submitted successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}
?>
