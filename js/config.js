// Configuration for Cloud Storage
// Update these values with your GitHub repository information

const CLOUD_CONFIG = {
    // GitHub repository settings
    githubToken: '', // Optional: Add your GitHub personal access token here for higher rate limits
    repoOwner: '', // Your GitHub username (will be set from localStorage)
    repoName: '', // Repository name for storing data (will be set from localStorage)
    branch: 'main', // Branch name
    dataPath: 'data/', // Path to data files in repository
    
    // Sync settings
    autoSync: true, // Automatically sync data changes
    syncInterval: 30000, // Sync every 30 seconds (in milliseconds)
    
    // Fallback settings
    useLocalStorageFallback: true, // Use localStorage if cloud sync fails
    enableConflictResolution: true // Handle conflicts between local and cloud data
};

// Alternative configuration using GitHub Pages (no token required for public repos)
const GITHUB_PAGES_CONFIG = {
    // For public repositories, you can use raw GitHub content
    useRawGitHub: true,
    rawBaseUrl: 'https://raw.githubusercontent.com',
    
    // Repository information
    repoOwner: '', // Will be set from localStorage
    repoName: '', // Will be set from localStorage
    branch: 'main',
    dataPath: 'data/',
    
    // Note: For writing data without a token, you'll need to use GitHub Actions
    // or a service like GitHub Pages with a simple API endpoint
};

// Export configurations
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CLOUD_CONFIG, GITHUB_PAGES_CONFIG };
}
