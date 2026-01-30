const STORAGE_KEYS = {
    MEMBERS: 'emsRosterMembers',
    ADMIN: 'emsAdminCredentials',
    LAST_SYNC: 'emsLastSync',
    CLOUD_ENABLED: 'emsCloudEnabled'
};

// Cloud storage instance (will be initialized if enabled)
let cloudStorage = null;
let syncInProgress = false;

function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN)) {
        const defaultAdmin = {
            username: 'EMS',
            password: hashPassword('7408574')
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(defaultAdmin));
    } else {
        // Update existing credentials to new values
        updateAdminCredentials('EMS', '7408574');
    }

    // Initialize cloud storage if enabled
    initCloudStorage();
}

// Initialize cloud storage
function initCloudStorage() {
    try {
        // Check if cloud storage is enabled
        const cloudEnabled = localStorage.getItem(STORAGE_KEYS.CLOUD_ENABLED);
        
        if (cloudEnabled === 'true') {
            // Load configuration from localStorage first
            const repoOwner = localStorage.getItem('emsRepoOwner') || '';
            const repoName = localStorage.getItem('emsRepoName') || '';
            const githubToken = localStorage.getItem('emsGithubToken') || '';
            
            // Only proceed if we have valid configuration
            if (repoOwner && repoName) {
                console.log('Initializing cloud storage with:', { repoOwner, repoName, hasToken: !!githubToken });
                
                // Update global config
                if (typeof CLOUD_CONFIG !== 'undefined') {
                    Object.assign(CLOUD_CONFIG, {
                        repoOwner: repoOwner,
                        repoName: repoName,
                        githubToken: githubToken
                    });
                }
                
                // Initialize CloudStorage class
                if (typeof CloudStorage !== 'undefined') {
                    cloudStorage = new CloudStorage(CLOUD_CONFIG);
                    
                    // Test connection and sync data
                    testCloudConnection();
                }
            } else {
                console.log('Cloud storage enabled but configuration incomplete');
            }
        }
    } catch (error) {
        console.error('Error initializing cloud storage:', error);
    }
}

// Test cloud connection
async function testCloudConnection() {
    if (!cloudStorage) return false;
    
    try {
        const test = await cloudStorage.testConnection();
        if (test.success) {
            console.log('Cloud storage connected successfully:', test.repo);
            
            // Sync data from cloud
            await syncFromCloud();
            return true;
        } else {
            console.error('Cloud storage connection failed:', test.error);
            return false;
        }
    } catch (error) {
        console.error('Error testing cloud connection:', error);
        return false;
    }
}

// Enable cloud storage
function enableCloudStorage(config) {
    try {
        // Save configuration to localStorage
        localStorage.setItem(STORAGE_KEYS.CLOUD_ENABLED, 'true');
        
        // Update global config
        if (typeof CLOUD_CONFIG !== 'undefined') {
            Object.assign(CLOUD_CONFIG, config);
        }
        
        // Reinitialize cloud storage
        initCloudStorage();
        
        return true;
    } catch (error) {
        console.error('Error enabling cloud storage:', error);
        return false;
    }
}

// Disable cloud storage
function disableCloudStorage() {
    localStorage.setItem(STORAGE_KEYS.CLOUD_ENABLED, 'false');
    cloudStorage = null;
    return true;
}

// Sync data from cloud to local
async function syncFromCloud() {
    if (!cloudStorage || syncInProgress) return;
    
    syncInProgress = true;
    
    try {
        // Get members from cloud
        const cloudMembers = await cloudStorage.getFile('members.json');
        if (cloudMembers) {
            // Merge with local data (cloud takes precedence)
            const localMembers = getMembers();
            const mergedMembers = mergeDataArrays(localMembers, cloudMembers);
            
            // Update local storage
            localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(mergedMembers));
            
            // Update last sync time
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
            
            // Refresh UI if roster is displayed
            if (typeof renderRoster === 'function') {
                renderRoster();
            }
            if (typeof renderAdminTable === 'function') {
                renderAdminTable();
            }
        }
        
        // Get admin credentials from cloud
        const cloudAdmin = await cloudStorage.getFile('admin.json');
        if (cloudAdmin) {
            localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(cloudAdmin));
        }
        
    } catch (error) {
        console.error('Error syncing from cloud:', error);
    } finally {
        syncInProgress = false;
    }
}

// Sync data from local to cloud
async function syncToCloud() {
    if (!cloudStorage || syncInProgress) return;
    
    syncInProgress = true;
    
    try {
        // Get local data
        const members = getMembers();
        const adminData = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN) || '{}');
        
        // Save to cloud
        const membersResult = await cloudStorage.saveFile('members.json', members, 'Update members data');
        const adminResult = await cloudStorage.saveFile('admin.json', adminData, 'Update admin credentials');
        
        if (membersResult.success && adminResult.success) {
            // Update last sync time
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
            console.log('Data synced to cloud successfully');
            return true;
        } else {
            console.error('Error syncing to cloud:', { membersResult, adminResult });
            return false;
        }
        
    } catch (error) {
        console.error('Error syncing to cloud:', error);
        return false;
    } finally {
        syncInProgress = false;
    }
}

// Merge data arrays (cloud data takes precedence, but preserves local unique items)
function mergeDataArrays(localData, cloudData) {
    const merged = [...cloudData];
    const cloudIds = new Set(cloudData.map(item => item.id));
    
    // Add local items that don't exist in cloud
    localData.forEach(localItem => {
        if (!cloudIds.has(localItem.id)) {
            merged.push(localItem);
        }
    });
    
    return merged;
}

// Auto-sync function
function startAutoSync() {
    if (!cloudStorage) return;
    
    setInterval(async () => {
        if (cloudStorage && !syncInProgress) {
            await syncFromCloud();
        }
    }, 30000); // Sync every 30 seconds
}

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

function getMembers() {
    const members = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return members ? JSON.parse(members) : [];
}

function getMemberById(id) {
    const members = getMembers();
    return members.find(member => member.id === id);
}

function addMember(memberData) {
    const members = getMembers();
    const newMember = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...memberData,
        createdAt: new Date().toISOString()
    };
    members.push(newMember);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    
    // Sync to cloud if enabled
    if (cloudStorage) {
        syncToCloud();
    }
    
    return newMember;
}

function updateMember(id, memberData) {
    const members = getMembers();
    const index = members.findIndex(member => member.id === id);
    if (index !== -1) {
        members[index] = {
            ...members[index],
            ...memberData,
            id: members[index].id,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
        
        // Sync to cloud if enabled
        if (cloudStorage) {
            syncToCloud();
        }
        
        return members[index];
    }
    return null;
}

function deleteMember(id) {
    const members = getMembers();
    const filteredMembers = members.filter(member => member.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(filteredMembers));
    
    // Sync to cloud if enabled
    if (cloudStorage) {
        syncToCloud();
    }
    
    return true;
}

function checkAdminCredentials(username, password) {
    const adminData = localStorage.getItem(STORAGE_KEYS.ADMIN);
    if (!adminData) return false;
    
    const admin = JSON.parse(adminData);
    return admin.username === username && admin.password === hashPassword(password);
}

function updateAdminCredentials(username, password) {
    const adminData = {
        username: username,
        password: hashPassword(password)
    };
    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(adminData));
    
    // Sync to cloud if enabled
    if (cloudStorage) {
        syncToCloud();
    }
    
    return true;
}

initStorage();
