// Cloud Storage Solution using GitHub as Backend
// This provides a simple way to sync data across devices without Node.js or paid cloud storage

class CloudStorage {
    constructor(config) {
        this.config = {
            githubToken: config.githubToken || '',
            repoOwner: config.repoOwner || '',
            repoName: config.repoName || '',
            branch: config.branch || 'main',
            dataPath: config.dataPath || 'data/',
            ...config
        };
        this.baseUrl = `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}`;
    }

    // Get headers for GitHub API requests
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        };
        
        if (this.config.githubToken) {
            headers['Authorization'] = `token ${this.config.githubToken}`;
        }
        
        return headers;
    }

    // Test file creation (simple test)
    async testFileCreation() {
        try {
            console.log('Testing file creation...');
            
            // Try to create a simple test file
            const testData = { test: true, timestamp: new Date().toISOString() };
            const result = await this.saveFile('test.json', testData, 'Test file creation');
            
            console.log('Test file creation result:', result);
            
            if (result.success) {
                // Clean up - delete the test file
                console.log('Cleaning up test file...');
                // Note: We would need a deleteFile function for this
            }
            
            return result;
        } catch (error) {
            console.error('Test file creation failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Initialize repository structure (create data directory and initial files)
    async initializeRepository() {
        try {
            const results = [];
            
            // Create initial members.json if it doesn't exist
            try {
                const membersData = await this.getFile('members.json');
                if (!membersData) {
                    console.log('Creating members.json file...');
                    const defaultMembers = [];
                    const result = await this.saveFile('members.json', defaultMembers, 'Initialize members data');
                    results.push({ file: 'members.json', ...result });
                    if (result.success) {
                        console.log('members.json created successfully');
                    } else {
                        console.error('Failed to create members.json:', result.error);
                    }
                } else {
                    console.log('members.json already exists');
                    results.push({ file: 'members.json', success: true, exists: true });
                }
            } catch (error) {
                console.error('Error checking/creating members.json:', error);
                results.push({ file: 'members.json', success: false, error: error.message });
            }
            
            // Create initial admin.json if it doesn't exist
            try {
                const adminData = await this.getFile('admin.json');
                if (!adminData) {
                    console.log('Creating admin.json file...');
                    const defaultAdmin = {
                        username: 'EMS',
                        password: this.hashPassword ? this.hashPassword('7408574') : '7408574'
                    };
                    const result = await this.saveFile('admin.json', defaultAdmin, 'Initialize admin data');
                    results.push({ file: 'admin.json', ...result });
                    if (result.success) {
                        console.log('admin.json created successfully');
                    } else {
                        console.error('Failed to create admin.json:', result.error);
                    }
                } else {
                    console.log('admin.json already exists');
                    results.push({ file: 'admin.json', success: true, exists: true });
                }
            } catch (error) {
                console.error('Error checking/creating admin.json:', error);
                results.push({ file: 'admin.json', success: false, error: error.message });
            }
            
            return {
                success: results.every(r => r.success || r.exists),
                results: results
            };
        } catch (error) {
            console.error('Error initializing repository:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get file content from GitHub
    async getFile(filename) {
        try {
            const response = await fetch(`${this.baseUrl}/contents/${this.config.dataPath}${filename}?ref=${this.config.branch}`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null; // File doesn't exist
                }
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const fileData = await response.json();
            
            if (fileData.type === 'file' && fileData.content) {
                // Decode base64 content
                const content = atob(fileData.content.replace(/\n/g, ''));
                return JSON.parse(content);
            }
            
            return null;
        } catch (error) {
            console.error('Error fetching file from GitHub:', error);
            return null;
        }
    }

    // Save file content to GitHub
    async saveFile(filename, data, message = 'Update data file') {
        try {
            // First, get the current file to get its SHA (if it exists)
            const currentFile = await this.getFileWithSha(filename);
            
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
            
            const body = {
                message: `${message} - ${new Date().toISOString()}`,
                content: content,
                branch: this.config.branch
            };

            // Include SHA only if file exists (for updating)
            // For new files, don't include SHA
            if (currentFile && currentFile.sha) {
                body.sha = currentFile.sha;
            }

            const response = await fetch(`${this.baseUrl}/contents/${this.config.dataPath}${filename}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errorMessage = `GitHub API error: ${response.status}`;
                
                if (response.status === 403) {
                    if (errorData.message && errorData.message.includes('Resource not accessible by personal access token')) {
                        errorMessage = `GitHub Token doesn't have write permissions. Please:\n1. Create a new token with 'repo' scope\n2. Or make the repository public`;
                    } else if (errorData.message && errorData.message.includes('Not Found')) {
                        errorMessage = `Repository not found or token doesn't have access. Please check repository name and token permissions.`;
                    } else {
                        errorMessage = `Access forbidden. Check your GitHub token permissions (needs 'repo' scope).`;
                    }
                } else if (response.status === 404) {
                    errorMessage = `Repository or path not found. Make sure the repository exists and is accessible.`;
                } else if (response.status === 422) {
                    if (errorData.message && errorData.message.includes('sha')) {
                        errorMessage = `SHA conflict. The file may have been modified by another process. Please try again.`;
                    } else {
                        errorMessage = `Validation error. The file might be too large or contain invalid data.`;
                    }
                }
                
                throw new Error(`${errorMessage} - ${errorData.message || 'Unknown error'}`);
            }

            const result = await response.json();
            return {
                success: true,
                sha: result.content.sha,
                commit: result.commit.sha
            };
        } catch (error) {
            console.error('Error saving file to GitHub:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get file with SHA information
    async getFileWithSha(filename) {
        try {
            const response = await fetch(`${this.baseUrl}/contents/${this.config.dataPath}${filename}?ref=${this.config.branch}`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                return null;
            }

            return await response.json();
        } catch (error) {
            return null;
        }
    }

    // Validate repository exists and is accessible
    async validateRepository() {
        try {
            if (!this.config.repoOwner || !this.config.repoName) {
                return {
                    valid: false,
                    error: 'Repository owner and name are required'
                };
            }

            // Check if repository exists (using GitHub API without authentication first)
            const response = await fetch(`https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const repoData = await response.json();
                return {
                    valid: true,
                    repo: repoData.full_name,
                    isPrivate: repoData.private,
                    defaultBranch: repoData.default_branch,
                    needsToken: repoData.private && !this.config.githubToken
                };
            } else if (response.status === 404) {
                return {
                    valid: false,
                    error: `Repository '${this.config.repoOwner}/${this.config.repoName}' not found. Please:\n1. Check the spelling\n2. Create the repository on GitHub\n3. Make sure it's public or provide a valid token`
                };
            } else if (response.status === 403) {
                return {
                    valid: false,
                    error: `Access forbidden. This might be a private repository. Please provide a GitHub token.`
                };
            } else {
                return {
                    valid: false,
                    error: `GitHub API error: ${response.status}`
                };
            }
        } catch (error) {
            return {
                valid: false,
                error: `Network error: ${error.message}`
            };
        }
    }

    // Test connection to GitHub
    async testConnection() {
        try {
            // First validate repository name format
            if (!this.config.repoOwner || !this.config.repoName) {
                throw new Error('Repository owner and name are required');
            }

            const response = await fetch(`${this.baseUrl}?ref=${this.config.branch}`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                let errorMessage = `Repository not accessible: ${response.status}`;
                
                if (response.status === 404) {
                    errorMessage = `Repository '${this.config.repoOwner}/${this.config.repoName}' not found. Please check:\n1. Repository name is correct\n2. Repository exists\n3. Repository is public (or you have a valid token)`;
                } else if (response.status === 403) {
                    errorMessage = `Access forbidden. Check your GitHub token or repository permissions.`;
                } else if (response.status === 401) {
                    errorMessage = `Authentication failed. Check your GitHub token.`;
                }
                
                throw new Error(errorMessage);
            }

            const repoData = await response.json();
            return {
                success: true,
                repo: repoData.full_name,
                defaultBranch: repoData.default_branch,
                isPrivate: repoData.private,
                description: repoData.description
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get last commit info for a file
    async getLastCommit(filename) {
        try {
            const response = await fetch(`${this.baseUrl}/commits?path=${this.config.dataPath}${filename}&sha=${this.config.branch}&per_page=1`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                return null;
            }

            const commits = await response.json();
            if (commits.length > 0) {
                return {
                    sha: commits[0].sha,
                    date: commits[0].commit.committer.date,
                    message: commits[0].commit.message,
                    author: commits[0].commit.author.name
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error getting last commit:', error);
            return null;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudStorage;
}
