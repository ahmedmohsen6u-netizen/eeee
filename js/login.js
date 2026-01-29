document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    if (sessionStorage.getItem('emsAdminSession')) {
        window.location.href = 'admin.html';
        return;
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showError('يرجى إدخال اسم المستخدم وكلمة المرور');
            return;
        }
        
        if (checkAdminCredentials(username, password)) {
            const sessionToken = generateSessionToken();
            sessionStorage.setItem('emsAdminSession', sessionToken);
            
            errorMessage.classList.remove('show');
            
            window.location.href = 'admin.html';
        } else {
            showError('اسم المستخدم أو كلمة المرور غير صحيحة');
            document.getElementById('password').value = '';
        }
    });
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }
    
    function generateSessionToken() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
});
