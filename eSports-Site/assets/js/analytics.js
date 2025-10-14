/**
 * eSports Hub - Analytics Integration
 * Handles Google Analytics and other tracking services
 */

// Configuration
const ANALYTICS_CONFIG = {
    // Replace with your actual Google Analytics tracking ID
    GA_TRACKING_ID: 'GA_TRACKING_ID_PLACEHOLDER',
    
    // Enable/disable analytics
    ENABLED: true,
    
    // Debug mode
    DEBUG: false
};

/**
 * Initialize analytics when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    if (ANALYTICS_CONFIG.ENABLED) {
        initializeAnalytics();
    }
});

/**
 * Initialize Google Analytics
 */
function initializeAnalytics() {
    // Load Google Analytics script
    loadGoogleAnalytics();
    
    // Track page views
    trackPageView();
    
    // Setup event tracking
    setupEventTracking();
    
    // Track user interactions
    trackUserInteractions();
    
    if (ANALYTICS_CONFIG.DEBUG) {
        console.log('Analytics initialized successfully');
    }
}

/**
 * Load Google Analytics script
 */
function loadGoogleAnalytics() {
    if (!ANALYTICS_CONFIG.GA_TRACKING_ID || ANALYTICS_CONFIG.GA_TRACKING_ID === 'GA_TRACKING_ID_PLACEHOLDER') {
        console.warn('Google Analytics tracking ID not configured');
        return;
    }
    
    // Create Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GA_TRACKING_ID}`;
    document.head.appendChild(script);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', ANALYTICS_CONFIG.GA_TRACKING_ID, {
        page_title: document.title,
        page_location: window.location.href
    });
    
    if (ANALYTICS_CONFIG.DEBUG) {
        console.log('Google Analytics script loaded');
    }
}

/**
 * Track page view
 */
function trackPageView() {
    const pageData = {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
    };
    
    if (window.gtag) {
        gtag('event', 'page_view', pageData);
    }
    
    // Track with custom analytics
    trackCustomEvent('page_view', pageData);
    
    if (ANALYTICS_CONFIG.DEBUG) {
        console.log('Page view tracked:', pageData);
    }
}

/**
 * Setup event tracking for common interactions
 */
function setupEventTracking() {
    // Track navigation clicks
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            trackEvent('navigation_click', {
                link_text: this.textContent.trim(),
                link_url: this.href,
                link_position: 'header'
            });
        });
    });
    
    // Track button clicks
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const buttonClass = this.className;
            
            trackEvent('button_click', {
                button_text: buttonText,
                button_class: buttonClass,
                button_href: this.href || null
            });
        });
    });
    
    // Track form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const formId = this.id || 'unnamed_form';
            const formClass = this.className;
            
            trackEvent('form_submit', {
                form_id: formId,
                form_class: formClass,
                form_action: this.action || null
            });
        });
    });
    
    // Track external links
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
    externalLinks.forEach(link => {
        link.addEventListener('click', function() {
            trackEvent('external_link_click', {
                link_url: this.href,
                link_text: this.textContent.trim()
            });
        });
    });
}

/**
 * Track user interactions
 */
function trackUserInteractions() {
    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = debounce(() => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);
        
        if (scrollPercent > maxScrollDepth && scrollPercent % 25 === 0) {
            maxScrollDepth = scrollPercent;
            trackEvent('scroll_depth', {
                scroll_percent: scrollPercent,
                page: window.location.pathname
            });
        }
    }, 1000);
    
    window.addEventListener('scroll', trackScrollDepth);
    
    // Track time on page
    let timeOnPage = 0;
    const startTime = Date.now();
    
    setInterval(() => {
        timeOnPage += 30;
        
        // Track every 30 seconds
        if (timeOnPage % 30 === 0) {
            trackEvent('time_on_page', {
                seconds: timeOnPage,
                page: window.location.pathname
            });
        }
    }, 30000);
    
    // Track when user leaves page
    window.addEventListener('beforeunload', function() {
        const totalTime = Math.round((Date.now() - startTime) / 1000);
        trackEvent('page_exit', {
            total_time_seconds: totalTime,
            page: window.location.pathname
        });
    });
}

/**
 * Track specific eSports events
 */
function trackESportsEvent(eventType, eventData = {}) {
    const baseData = {
        event_category: 'esports',
        event_label: eventType,
        page: window.location.pathname,
        timestamp: new Date().toISOString()
    };
    
    const finalData = Object.assign(baseData, eventData);
    
    trackEvent(eventType, finalData);
    
    if (ANALYTICS_CONFIG.DEBUG) {
        console.log('eSports event tracked:', eventType, finalData);
    }
}

/**
 * Track tournament interactions
 */
function trackTournamentEvent(action, tournamentData) {
    trackESportsEvent('tournament_interaction', {
        action: action,
        tournament_name: tournamentData.name || 'Unknown',
        tournament_id: tournamentData.id || null,
        tournament_prize: tournamentData.prize || null,
        tournament_date: tournamentData.date || null
    });
}

/**
 * Track news article interactions
 */
function trackNewsEvent(action, articleData) {
    trackESportsEvent('news_interaction', {
        action: action,
        article_title: articleData.title || 'Unknown',
        article_category: articleData.category || null,
        article_date: articleData.date || null
    });
}

/**
 * Track player/team interactions
 */
function trackPlayerTeamEvent(action, entityData) {
    trackESportsEvent('player_team_interaction', {
        action: action,
        entity_type: entityData.type || 'unknown', // 'player' or 'team'
        entity_name: entityData.name || 'Unknown',
        entity_id: entityData.id || null
    });
}

/**
 * Track shop interactions
 */
function trackShopEvent(action, productData) {
    trackESportsEvent('shop_interaction', {
        action: action,
        product_name: productData.name || 'Unknown',
        product_id: productData.id || null,
        product_price: productData.price || null,
        product_category: productData.category || null
    });
}

/**
 * Track video interactions
 */
function trackVideoEvent(action, videoData) {
    trackESportsEvent('video_interaction', {
        action: action,
        video_title: videoData.title || 'Unknown',
        video_duration: videoData.duration || null,
        video_type: videoData.type || 'highlight' // 'highlight', 'stream', 'tutorial'
    });
}

/**
 * Generic event tracking function
 */
function trackEvent(eventName, eventData = {}) {
    // Track with Google Analytics if available
    if (window.gtag) {
        gtag('event', eventName, eventData);
    }
    
    // Track with custom analytics
    trackCustomEvent(eventName, eventData);
    
    if (ANALYTICS_CONFIG.DEBUG) {
        console.log('Event tracked:', eventName, eventData);
    }
}

/**
 * Custom analytics tracking (for additional services)
 */
function trackCustomEvent(eventName, eventData) {
    // Example: Send to custom analytics endpoint
    // In a real implementation, you would send this data to your analytics service
    
    const analyticsData = {
        event: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        url: window.location.href
    };
    
    // Example: Send to custom endpoint
    // fetch('/api/analytics', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(analyticsData)
    // }).catch(error => {
    //     console.error('Analytics tracking error:', error);
    // });
    
    if (ANALYTICS_CONFIG.DEBUG) {
        console.log('Custom analytics data:', analyticsData);
    }
}

/**
 * Track user engagement metrics
 */
function trackEngagement() {
    // Track clicks on key elements
    const engagementElements = document.querySelectorAll('.news-card, .tournament-card, .highlight-card');
    
    engagementElements.forEach(element => {
        element.addEventListener('click', function() {
            const elementType = this.classList.contains('news-card') ? 'news' :
                              this.classList.contains('tournament-card') ? 'tournament' : 'highlight';
            
            trackEvent('engagement_click', {
                element_type: elementType,
                element_position: Array.from(engagementElements).indexOf(this),
                page: window.location.pathname
            });
        });
    });
    
    // Track search queries (if search functionality exists)
    const searchInputs = document.querySelectorAll('input[type="search"], input[name*="search"]');
    searchInputs.forEach(input => {
        input.addEventListener('search', function() {
            if (this.value.trim()) {
                trackEvent('search_query', {
                    search_term: this.value.trim(),
                    page: window.location.pathname
                });
            }
        });
    });
}

/**
 * Track performance metrics
 */
function trackPerformance() {
    // Track page load time
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        
        trackEvent('page_performance', {
            load_time_ms: loadTime,
            page: window.location.pathname
        });
        
        if (ANALYTICS_CONFIG.DEBUG) {
            console.log('Page load time:', loadTime + 'ms');
        }
    });
    
    // Track Core Web Vitals (if supported)
    if ('web-vitals' in window) {
        // This would require importing the web-vitals library
        // getCLS, getFID, getFCP, getLCP, getTTFB
    }
}

/**
 * Utility function to debounce events
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Initialize engagement and performance tracking
 */
function initializeAdvancedTracking() {
    trackEngagement();
    trackPerformance();
}

/**
 * Export analytics functions for use in other scripts
 */
window.eSportsAnalytics = {
    trackEvent,
    trackESportsEvent,
    trackTournamentEvent,
    trackNewsEvent,
    trackPlayerTeamEvent,
    trackShopEvent,
    trackVideoEvent,
    trackPageView,
    initializeAdvancedTracking
};

// Initialize advanced tracking
document.addEventListener('DOMContentLoaded', function() {
    if (ANALYTICS_CONFIG.ENABLED) {
        initializeAdvancedTracking();
    }
});
