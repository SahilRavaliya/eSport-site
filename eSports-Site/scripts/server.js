/**
 * eSports Hub - Node.js Server
 * Basic server setup for handling API requests and serving static files
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// API Routes
app.get('/api/news', (req, res) => {
    // Mock news data
    const newsData = [
        {
            id: 1,
            title: "Championship Finals This Weekend",
            category: "Tournament",
            content: "The biggest eSports championship of the year is happening this weekend with a prize pool of $1M.",
            date: "2024-12-15",
            author: "Sarah Johnson",
            image: "assets/images/tournaments/tournament-poster.png"
        },
        {
            id: 2,
            title: "New Rising Star in Competitive Gaming",
            category: "Players",
            content: "Meet the 18-year-old prodigy who's taking the competitive scene by storm.",
            date: "2024-12-14",
            author: "Mike Rodriguez",
            image: "assets/images/players/player1.jpg"
        }
    ];
    
    res.json(newsData);
});

app.get('/api/tournaments', (req, res) => {
    // Mock tournament data
    const tournamentData = [
        {
            id: 1,
            name: "World Championship 2024",
            game: "League of Legends",
            date: "2024-12-20",
            prize: 1500000,
            status: "upcoming",
            location: "Los Angeles, CA"
        },
        {
            id: 2,
            name: "Dota 2 Major Championship",
            game: "Dota 2",
            date: "2025-02-10",
            prize: 1200000,
            status: "upcoming",
            location: "Stockholm, Sweden"
        }
    ];
    
    res.json(tournamentData);
});

app.get('/api/teams', (req, res) => {
    // Mock team data
    const teamData = [
        {
            id: 1,
            name: "Team Thunder",
            game: "League of Legends",
            region: "Europe",
            tier: "Tier 1",
            wins: 45,
            losses: 12,
            players: [
                { name: "Alex Lightning Chen", role: "Top Lane" },
                { name: "Sarah Storm Johnson", role: "Jungle" },
                { name: "Mike Thunder Rodriguez", role: "Mid Lane" },
                { name: "Emma Volt Thompson", role: "ADC" },
                { name: "James Spark Wilson", role: "Support" }
            ]
        }
    ];
    
    res.json(teamData);
});

app.get('/api/players', (req, res) => {
    // Mock player data
    const playerData = [
        {
            id: 1,
            name: "Alex Lightning Chen",
            team: "Team Thunder",
            game: "League of Legends",
            rank: 1,
            kda: 8.2,
            winRate: 78
        }
    ];
    
    res.json(playerData);
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }
    
    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Log the submission
    
    console.log('Contact form submission:', { name, email, subject, message });
    
    res.json({ 
        success: true, 
        message: 'Message sent successfully' 
    });
});

// Newsletter subscription
app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ 
            success: false, 
            message: 'Email is required' 
        });
    }
    
    // In a real application, you would:
    // 1. Validate email format
    // 2. Check if already subscribed
    // 3. Save to database
    // 4. Add to mailing list
    
    console.log('Newsletter subscription:', email);
    
    res.json({ 
        success: true, 
        message: 'Successfully subscribed to newsletter' 
    });
});

// Tournament registration
app.post('/api/tournament-register', (req, res) => {
    const { teamName, captain, email, experience, info } = req.body;
    
    // Validate required fields
    if (!teamName || !captain || !email || !experience) {
        return res.status(400).json({ 
            success: false, 
            message: 'All required fields must be filled' 
        });
    }
    
    // In a real application, you would:
    // 1. Validate team eligibility
    // 2. Check tournament capacity
    // 3. Save registration to database
    // 4. Send confirmation email
    
    console.log('Tournament registration:', { teamName, captain, email, experience, info });
    
    res.json({ 
        success: true, 
        message: 'Registration submitted successfully' 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!' 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Endpoint not found' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`eSports Hub server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the site`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
