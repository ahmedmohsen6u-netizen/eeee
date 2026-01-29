const DEPARTMENTS = {
    'MANAGEMENT_STAFF': 'MANGMENT STAFF',
    'HOSPITAL_SUPERVISOR': 'Hospital Supervisor',
    'HUMAN_RESOURCES': 'Human resources',
    'DOCTORS': 'Doctors',
    'MEDICAL_DIRECTOR': 'Medical Director',
    'PARAMEDIC_SUPERVISOR': 'Paramedic Supervisor',
    'PARAMEDIC_OFFICER': 'Paramedic Officer/Lead Paramedic (Call signs From P-01 to P-20)',
    'CRITICAL_CARE': 'Critical Care Paramedic/Licensed Paramedic (Call signs From P-01 to P-20)',
    'SENIOR_PARAMEDICS': 'Senior Paramedics and Paramedics (Call signs From P-21 to P-39)',
    'SENIOR_EMT': 'Senior EMT and EMT (Call signs From E-40 to E-79)',
    'CADET_STUDENTS': 'Cadet / Students (Call Signs From C-80 to C-99)'
};

function renderRoster() {
    const members = getMembers();
    const tbody = document.getElementById('rosterBody');
    
    const groupedMembers = {};
    Object.keys(DEPARTMENTS).forEach(key => {
        groupedMembers[key] = [];
    });
    
    if (members && members.length > 0) {
        members.forEach(member => {
            const deptKey = member.department || 'CADET_STUDENTS';
            if (groupedMembers[deptKey]) {
                groupedMembers[deptKey].push(member);
            } else {
                groupedMembers['CADET_STUDENTS'].push(member);
            }
        });
    }
    
    let html = '';
    
    Object.keys(DEPARTMENTS).forEach(deptKey => {
        const deptMembers = groupedMembers[deptKey];
        html += `
            <tr class="department-header">
                <td colspan="11">${DEPARTMENTS[deptKey]}</td>
            </tr>
        `;
        
        if (deptMembers && deptMembers.length > 0) {
            deptMembers.forEach(member => {
                html += `
                    <tr class="fade-in">
                        <td><a href="#" class="member-name" onclick="showMemberDetails('${member.id}'); return false;">${sanitizeHTML(member.firstName || '')}</a></td>
                        <td>${sanitizeHTML(member.lastName || '')}</td>
                        <td>${sanitizeHTML(member.title || '')}</td>
                        <td>${sanitizeHTML(member.callsign || '')}</td>
                        <td>${sanitizeHTML(member.hireDate || '')}</td>
                        <td>${sanitizeHTML(member.lastPromotion || '')}</td>
                        <td>${sanitizeHTML(member.discord || '')}</td>
                        <td><div class="checkbox-display ${member.mi ? 'checked' : ''}"></div></td>
                        <td><div class="checkbox-display ${member.air ? 'checked' : ''}"></div></td>
                        <td><div class="checkbox-display ${member.fp ? 'checked' : ''}"></div></td>
                        <td>${sanitizeHTML(member.notes || '')}</td>
                    </tr>
                `;
            });
        } else {
            html += `
                <tr class="fade-in">
                    <td colspan="11" style="text-align: center; color: #999; padding: 15px; font-style: italic;">لا يوجد أعضاء في هذا القسم</td>
                </tr>
            `;
        }
        
        html += `
            <tr>
                <td colspan="11" class="department-separator" style="height: 15px; padding: 0; background: linear-gradient(90deg, transparent, #C8E6C9, transparent);"></td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showMemberDetails(memberId) {
    const member = getMemberById(memberId);
    if (!member) return;
    
    const modal = document.getElementById('memberModal');
    const modalPhoto = document.getElementById('modalPhoto');
    const modalName = document.getElementById('modalName');
    const modalTitle = document.getElementById('modalTitle');
    const modalDepartment = document.getElementById('modalDepartment');
    const modalCallsign = document.getElementById('modalCallsign');
    const modalDiscord = document.getElementById('modalDiscord');
    
    if (member.photo) {
        modalPhoto.src = member.photo;
        modalPhoto.style.display = 'block';
    } else {
        modalPhoto.style.display = 'none';
    }
    
    modalName.textContent = `${member.firstName || ''} ${member.lastName || ''}`;
    modalTitle.textContent = member.title || '';
    modalDepartment.textContent = DEPARTMENTS[member.department] || '';
    modalCallsign.textContent = member.callsign ? `Callsign: ${member.callsign}` : '';
    modalDiscord.textContent = member.discord ? `Discord: ${member.discord}` : '';
    
    modal.classList.add('active');
}

function closeMemberDetails() {
    const modal = document.getElementById('memberModal');
    modal.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', function() {
    renderRoster();
    
    const modal = document.getElementById('memberModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeMemberDetails();
        }
    });
});
