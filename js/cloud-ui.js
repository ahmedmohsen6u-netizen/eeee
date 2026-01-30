// Cloud Storage UI Functions
// These functions handle the user interface for cloud storage configuration

// Initialize tabs functionality
function initializeCloudTabs() {
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabItems.forEach(tab => tab.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Update status information when switching to status tab
            if (targetTab === 'status') {
                updateStatusTabInfo();
            }
        });
    });
}

// Update status tab information
function updateStatusTabInfo() {
    const connectionStatus = document.getElementById('connectionStatus');
    const repoInfo = document.getElementById('repoInfo');
    const syncInfo = document.getElementById('syncInfo');
    const repoTypeInfo = document.getElementById('repoTypeInfo');
    
    // Check if we're on the admin page (where these elements exist)
    if (!connectionStatus || !repoInfo || !syncInfo || !repoTypeInfo) {
        return; // Exit silently if elements don't exist (not on admin page)
    }
    
    try {
        const cloudEnabled = localStorage.getItem('emsCloudEnabled');
        const repoOwner = localStorage.getItem('emsRepoOwner');
        const repoName = localStorage.getItem('emsRepoName');
        const lastSync = localStorage.getItem('emsLastSync');
        
        // Check if cloud is enabled and has valid configuration
        const isConfigured = cloudEnabled === 'true' && repoOwner && repoName;
        
        if (isConfigured) {
            connectionStatus.textContent = cloudStorage ? 'متصل' : 'مفعل';
            connectionStatus.style.color = 'var(--success-green)';
            
            if (repoOwner && repoName) {
                repoInfo.textContent = `${repoOwner}/${repoName}`;
                repoInfo.style.color = 'var(--text-dark)';
            } else {
                repoInfo.textContent = 'غير محدد';
                repoInfo.style.color = 'var(--medium-gray)';
            }
            
            if (lastSync) {
                const syncDate = new Date(lastSync);
                syncInfo.textContent = syncDate.toLocaleString('ar-EG');
                syncInfo.style.color = 'var(--text-dark)';
            } else {
                syncInfo.textContent = 'لم تتم المزامنة بعد';
                syncInfo.style.color = 'var(--medium-gray)';
            }
            
            repoTypeInfo.textContent = 'عام'; // We could enhance this to detect private repos
            repoTypeInfo.style.color = 'var(--text-dark)';
        } else {
            connectionStatus.textContent = 'غير متصل';
            connectionStatus.style.color = 'var(--medium-gray)';
            repoInfo.textContent = 'غير محدد';
            repoInfo.style.color = 'var(--medium-gray)';
            syncInfo.textContent = 'غير متاحة';
            syncInfo.style.color = 'var(--medium-gray)';
            repoTypeInfo.textContent = 'غير محدد';
            repoTypeInfo.style.color = 'var(--medium-gray)';
        }
    } catch (error) {
        console.error('Error updating status tab:', error);
    }
}

// Toggle cloud storage configuration fields
function toggleCloudStorage() {
    const enableCloud = document.getElementById('enableCloud');
    const tabsContainer = document.getElementById('cloudTabsContainer');
    
    if (enableCloud.checked) {
        // Enable cloud storage
        localStorage.setItem('emsCloudEnabled', 'true');
        
        tabsContainer.style.display = 'block';
        tabsContainer.style.opacity = '0';
        tabsContainer.style.transform = 'translateY(20px)';
        
        // Animate in the tabs container
        setTimeout(() => {
            tabsContainer.style.transition = 'all 0.3s ease';
            tabsContainer.style.opacity = '1';
            tabsContainer.style.transform = 'translateY(0)';
        }, 100);
        
        loadCloudConfig();
    } else {
        // Disable cloud storage
        localStorage.setItem('emsCloudEnabled', 'false');
        
        // Animate out the tabs container
        tabsContainer.style.transition = 'all 0.3s ease';
        tabsContainer.style.opacity = '0';
        tabsContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            tabsContainer.style.display = 'none';
        }, 300);
        
        disableCloudStorage();
    }
    
    // Update status immediately
    updateCloudStatus();
    updateStatusTabInfo();
}

// Load existing cloud configuration
function loadCloudConfig() {
    try {
        const cloudEnabled = localStorage.getItem('emsCloudEnabled');
        const repoOwner = localStorage.getItem('emsRepoOwner');
        const repoName = localStorage.getItem('emsRepoName');
        const githubToken = localStorage.getItem('emsGithubToken');
        
        // Set the toggle switch state based on stored value
        const enableCloudCheckbox = document.getElementById('enableCloud');
        if (cloudEnabled === 'true') {
            enableCloudCheckbox.checked = true;
            document.getElementById('cloudTabsContainer').style.display = 'block';
            
            if (repoOwner) document.getElementById('repoOwner').value = repoOwner;
            if (repoName) document.getElementById('repoName').value = repoName;
            if (githubToken) document.getElementById('githubToken').value = githubToken;
        } else {
            enableCloudCheckbox.checked = false;
            document.getElementById('cloudTabsContainer').style.display = 'none';
        }
        
        updateCloudStatus();
        updateStatusTabInfo();
    } catch (error) {
        console.error('Error loading cloud config:', error);
    }
}

// Update cloud status display
function updateCloudStatus() {
    const statusText = document.getElementById('cloudStatusText');
    const lastSyncTime = document.getElementById('lastSyncTime');
    const statusCard = document.getElementById('cloudStatusCard');
    
    // Check if we're on the admin page (where these elements exist)
    if (!statusText || !lastSyncTime || !statusCard) {
        return; // Exit silently if elements don't exist (not on admin page)
    }
    
    try {
        const cloudEnabled = localStorage.getItem('emsCloudEnabled');
        const lastSync = localStorage.getItem('emsLastSync');
        const repoOwner = localStorage.getItem('emsRepoOwner');
        const repoName = localStorage.getItem('emsRepoName');
        
        // Check if cloud is enabled and has valid configuration
        const isConfigured = cloudEnabled === 'true' && repoOwner && repoName;
        
        if (isConfigured) {
            statusText.textContent = 'مفعل';
            statusText.style.color = 'var(--success-green)';
            statusCard.style.borderColor = 'var(--success-green)';
            statusCard.style.background = 'linear-gradient(135deg, rgba(67, 160, 71, 0.1) 0%, rgba(46, 125, 50, 0.05) 100%)';
            
            if (lastSync) {
                const syncDate = new Date(lastSync);
                lastSyncTime.textContent = `آخر مزامنة: ${syncDate.toLocaleString('ar-EG')}`;
            } else {
                lastSyncTime.textContent = 'آخر مزامنة: لم تتم المزامنة بعد';
            }
        } else {
            statusText.textContent = 'غير مفعل';
            statusText.style.color = 'var(--medium-gray)';
            statusCard.style.borderColor = 'var(--light-gray)';
            statusCard.style.background = 'var(--white)';
            lastSyncTime.textContent = 'آخر مزامنة: غير متاحة';
        }
        
        // Update dark theme styles
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            if (isConfigured) {
                statusCard.style.background = 'linear-gradient(135deg, rgba(102, 187, 106, 0.1) 0%, rgba(46, 125, 50, 0.05) 100%)';
            } else {
                statusCard.style.background = 'var(--bg-secondary)';
            }
        }
    } catch (error) {
        console.error('Error updating cloud status:', error);
    }
}

// Test cloud connection
async function testCloudConnection() {
    const messageDiv = document.getElementById('cloudMessage');
    const repoOwner = document.getElementById('repoOwner').value.trim();
    const repoName = document.getElementById('repoName').value.trim();
    const githubToken = document.getElementById('githubToken').value.trim();
    
    if (!repoOwner || !repoName) {
        showMessage(messageDiv, 'يرجى إدخال اسم المستخدم واسم المستودع', 'error');
        return;
    }
    
    // Show loading message with animation
    showCloudMessage(messageDiv, '<div class="loading-spinner"></div> جاري التحقق من المستودع...', 'info');
    
    try {
        // Create temporary cloud storage instance for testing
        const testConfig = {
            repoOwner: repoOwner,
            repoName: repoName,
            githubToken: githubToken || '',
            branch: 'main',
            dataPath: 'data/'
        };
        
        const testCloudStorage = new CloudStorage(testConfig);
        
        // First validate repository exists
        const validation = await testCloudStorage.validateRepository();
        
        if (!validation.valid) {
            if (validation.error.includes('not found')) {
                // Show helpful message for creating repository
                showCreateRepositoryHelp(repoOwner, repoName);
            } else {
                showCloudMessage(messageDiv, `خطأ في المستودع:\n${validation.error}`, 'error');
            }
            return;
        }
        
        // If repository is private and no token provided
        if (validation.needsToken) {
            showCloudMessage(messageDiv, 'المستودع خاص. يرجى إدخال GitHub Token.', 'warning');
            return;
        }
        
        // Repository exists, now test full connection
        showCloudMessage(messageDiv, '<div class="loading-spinner"></div> المستودع موجود. جاري اختبار الاتصال الكامل...', 'info');
        
        const result = await testCloudStorage.testConnection();
        
        if (result.success) {
            let message = `✅ تم الاتصال بنجاح بالمستودع: <strong>${result.repo}</strong>`;
            if (result.isPrivate) {
                message += ' (خاص)';
            } else {
                message += ' (عام)';
            }
            showCloudMessage(messageDiv, message, 'success');
        } else {
            showCloudMessage(messageDiv, `❌ فشل الاتصال: ${result.error}`, 'error');
        }
    } catch (error) {
        showCloudMessage(messageDiv, `❌ خطأ في الاتصال: ${error.message}`, 'error');
    }
}

// Save cloud configuration
async function saveCloudConfig(event) {
    event.preventDefault();
    
    const messageDiv = document.getElementById('cloudMessage');
    const repoOwner = document.getElementById('repoOwner').value.trim();
    const repoName = document.getElementById('repoName').value.trim();
    const githubToken = document.getElementById('githubToken').value.trim();
    
    if (!repoOwner || !repoName) {
        showCloudMessage(messageDiv, 'يرجى إدخال اسم المستخدم واسم المستودع', 'error');
        return;
    }
    
    // Show loading message
    showCloudMessage(messageDiv, '<div class="loading-spinner"></div> جاري حفظ الإعدادات وتجهيز المستودع...', 'info');
    
    try {
        // Save configuration to localStorage
        localStorage.setItem('emsRepoOwner', repoOwner);
        localStorage.setItem('emsRepoName', repoName);
        if (githubToken) {
            localStorage.setItem('emsGithubToken', githubToken);
        }
        
        // Update global config
        const config = {
            repoOwner: repoOwner,
            repoName: repoName,
            githubToken: githubToken,
            branch: 'main',
            dataPath: 'data/'
        };
        
        // Enable cloud storage
        const success = enableCloudStorage(config);
        
        if (success) {
            // Wait a moment for initialization
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (cloudStorage) {
                // First validate repository
                const validation = await cloudStorage.validateRepository();
                
                if (!validation.valid) {
                    showCloudMessage(messageDiv, `خطأ في المستودع: ${validation.error}`, 'error');
                    return;
                }
                
                // If repository is private and no token provided
                if (validation.needsToken) {
                    showCloudMessage(messageDiv, 'المستودع خاص. يرجى إدخال GitHub Token.', 'warning');
                    return;
                }
                
                // Initialize repository structure
                showCloudMessage(messageDiv, '<div class="loading-spinner"></div> المستودع صالح. جاري اختبار إنشاء الملفات...', 'info');
                
                // First test file creation
                const testResult = await cloudStorage.testFileCreation();
                
                if (!testResult.success) {
                    // Check if it's a permission issue
                    if (testResult.error && testResult.error.includes('403')) {
                        showCloudMessage(messageDiv, `❌ خطأ في الصلاحيات:\n${testResult.error}\n\nالحلول:\n1. تأكد من أن GitHub Token يحتوي على صلاحية 'repo'\n2. اجعل المستودع عاماً (Public)\n3. أنشئ token جديد بالصلاحيات الصحيحة\n\nاضغط على زر "مساعدة" بجانب حقل Token للحصول على إرشادات.`, 'error');
                        return;
                    } else {
                        showCloudMessage(messageDiv, `❌ فشل اختبار إنشاء الملفات: ${testResult.error}`, 'error');
                        return;
                    }
                }
                
                // If test passed, proceed with initialization
                showCloudMessage(messageDiv, '<div class="loading-spinner"></div> اختبار إنشاء الملفات نجح. جاري تهيئة المستودع...', 'info');
                
                const initResult = await cloudStorage.initializeRepository();
                
                if (initResult.success) {
                    // Now sync current data
                    showCloudMessage(messageDiv, '<div class="loading-spinner"></div> تم تهيئة المستودع. جاري مزامنة البيانات...', 'info');
                    
                    const syncResult = await syncToCloud();
                    if (syncResult) {
                        showCloudMessage(messageDiv, '✅ تم حفظ الإعدادات ومزامنة البيانات بنجاح!\nالمستودع جاهز للاستخدام.', 'success');
                        updateCloudStatus();
                        updateStatusTabInfo();
                    } else {
                        showCloudMessage(messageDiv, '⚠️ تم تهيئة المستودع ولكن فشلت المزامنة. يرجى المحاولة مرة أخرى.', 'warning');
                    }
                } else {
                    // Check if it's a permission issue
                    if (initResult.error && initResult.error.includes('403')) {
                        showCloudMessage(messageDiv, `❌ خطأ في الصلاحيات:\n${initResult.error}\n\nالحلول:\n1. تأكد من أن GitHub Token يحتوي على صلاحية 'repo'\n2. اجعل المستودع عاماً (Public)\n3. أنشئ token جديد بالصلاحيات الصحيحة`, 'error');
                    } else {
                        showCloudMessage(messageDiv, `❌ فشلت تهيئة المستودع: ${initResult.error}`, 'error');
                    }
                }
            } else {
                showCloudMessage(messageDiv, '✅ تم حفظ الإعدادات بنجاح', 'success');
                updateCloudStatus();
                updateStatusTabInfo();
            }
        } else {
            showCloudMessage(messageDiv, '❌ فشل حفظ الإعدادات', 'error');
        }
    } catch (error) {
        showCloudMessage(messageDiv, `❌ خطأ في حفظ الإعدادات: ${error.message}`, 'error');
    }
}

// Show cloud message with enhanced styling
function showCloudMessage(element, message, type) {
    element.style.display = 'block';
    element.className = `cloud-message ${type}`;
    
    // Handle multi-line messages and HTML
    if (message.includes('\n')) {
        element.innerHTML = message.replace(/\n/g, '<br>');
    } else {
        element.innerHTML = message;
    }
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// Create repository helper function
function showCreateRepositoryHelp(repoOwner, repoName) {
    const messageDiv = document.getElementById('cloudMessage');
    
    const helpMessage = `
المستودع '${repoOwner}/${repoName}' غير موجود. لإنشائه:

1. اذهب إلى: https://github.com/new
2. أدخل اسم المستودع: ${repoName}
3. اجعله **Public** (مجاني) أو **Private** (يتطلب Token)
4. اضغط على "Create repository"
5. ارجع واضغط "اختبار الاتصال" مرة أخرى

رابط مباشر: https://github.com/new?name=${encodeURIComponent(repoName)}
    `;
    
    showMessage(messageDiv, helpMessage, 'info');
}

// Debug function to check configuration
function debugCloudConfig() {
    const messageDiv = document.getElementById('cloudMessage');
    const repoOwner = document.getElementById('repoOwner').value.trim();
    const repoName = document.getElementById('repoName').value.trim();
    const githubToken = document.getElementById('githubToken').value.trim();
    
    const debugInfo = `
معلومات التصحيح:
- اسم المستخدم: ${repoOwner || '(غير مدخل)'}
- اسم المستودع: ${repoName || '(غير مدخل)'}
- Token: ${githubToken ? '(مدخل)' : '(غير مدخل)'}
- رابط المستودع: https://github.com/${repoOwner}/${repoName}
- رابط API: https://api.github.com/repos/${repoOwner}/${repoName}

الخطوات التالية:
1. تأكد من وجود المستودع: https://github.com/${repoOwner}/${repoName}
2. تأكد من صلاحيات Token (تحتوي على 'repo')
3. إذا كان المستودع خاص، يجب إدخال Token
4. إذا كان المستودع عام، قد لا تحتاج إلى Token
    `;
    
    showMessage(messageDiv, debugInfo, 'info');
}

// Show GitHub token creation help
function showTokenHelp() {
    const messageDiv = document.getElementById('cloudMessage');
    
    const helpMessage = `
لإنشاء GitHub Token:

1. اذهب إلى: https://github.com/settings/tokens
2. اضغط على "Generate new token" → "Generate new token (classic)"
3. أعطِ الاسم أي اسم (مثال: "EMS Roster")
4. اختر الصلاحيات: ✅ **repo** (مهم جداً)
5. اضغط على "Generate token"
6. **انسخ الToken واحفظه** (لن يظهر مرة أخرى)

ملاحظات:
- الToken يمنح صلاحية الكتابة في المستودعات
- للمستودعات العامة، قد لا تحتاج إلى token
- احتفظ بالToken في مكان آمن

رابط مباشر: https://github.com/settings/tokens/new
    `;
    
    showCloudMessage(messageDiv, helpMessage, 'info');
}

// Manual sync function
async function manualSync() {
    const messageDiv = document.getElementById('cloudMessage');
    
    if (!cloudStorage) {
        showCloudMessage(messageDiv, 'التخزين السحابي غير مفعل', 'error');
        return;
    }
    
    showCloudMessage(messageDiv, '<div class="loading-spinner"></div> جاري المزامنة...', 'info');
    
    try {
        const result = await syncToCloud();
        if (result) {
            showCloudMessage(messageDiv, '✅ تمت المزامنة بنجاح!', 'success');
            updateCloudStatus();
            updateStatusTabInfo();
        } else {
            showCloudMessage(messageDiv, '❌ فشلت المزامنة', 'error');
        }
    } catch (error) {
        showCloudMessage(messageDiv, `❌ خطأ في المزامنة: ${error.message}`, 'error');
    }
}

// Initialize cloud UI when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
    initializeCloudTabs();
    
    // Load cloud configuration if form exists
    if (document.getElementById('cloudConfigForm')) {
        loadCloudConfig();
        
        // Add form submit handler
        document.getElementById('cloudConfigForm').addEventListener('submit', saveCloudConfig);
    }
    
    // Update status immediately and then periodically (only if on admin page)
    updateCloudStatus();
    updateStatusTabInfo();
    
    // Update status periodically only if cloud status elements exist
    if (document.getElementById('cloudStatusText')) {
        setInterval(() => {
            updateCloudStatus();
            updateStatusTabInfo();
        }, 30000); // Update every 30 seconds
    }
});

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.toggleCloudStorage = toggleCloudStorage;
    window.testCloudConnection = testCloudConnection;
    window.saveCloudConfig = saveCloudConfig;
    window.manualSync = manualSync;
    window.updateCloudStatus = updateCloudStatus;
    window.showCreateRepositoryHelp = showCreateRepositoryHelp;
    window.showTokenHelp = showTokenHelp;
    window.initializeCloudTabs = initializeCloudTabs;
}
