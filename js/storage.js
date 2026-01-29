const STORAGE_KEYS = {
    MEMBERS: 'emsRosterMembers',
    ADMIN: 'emsAdminCredentials'
};

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
        return members[index];
    }
    return null;
}

function deleteMember(id) {
    const members = getMembers();
    const filteredMembers = members.filter(member => member.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(filteredMembers));
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
    return true;
}

initStorage();
