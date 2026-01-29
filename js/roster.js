const DEPARTMENTS = {
    'MANAGEMENT_STAFF': 'MANGMENT STAFF',
    'HOSPITAL_SUPERVISOR': 'Hospital Supervisor',
    'HUMAN_RESOURCES': 'Human resources',
    'CHIEF_OF_DOCTOR': 'Chief of Doctor',
    'DOCTORS': 'Doctors',
    'EMS_SUPERVISOR': 'EMS Supervisor',
    'MEDICAL_DIRECTOR': 'Medical Director',
    'PARAMEDIC_SUPERVISOR': 'Paramedic Officer',
    'PARAMEDIC_OFFICER': 'Licensed Paramedic (Call signs From P-01 to P-20)',
    'SENIOR_PARAMEDICS': 'Senior Paramedics and Paramedics (Call signs From P-21 to P-39)',
    'SENIOR_EMT': 'Advanced EMT and EMT (Call signs From E-40 to E-59)',
    'ECA': 'ECA (Call signs From E-60 to E-79)',
    'CADET_STUDENTS': 'Students (Call Signs From C-80 to C-99)'
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
            // Sort members within SENIOR_PARAMEDICS department: Senior Paramedics first, then Paramedics
            if (deptKey === 'SENIOR_PARAMEDICS') {
                deptMembers.sort((a, b) => {
                    const aIsSenior = (a.title === 'Senior Paramedics');
                    const bIsSenior = (b.title === 'Senior Paramedics');
                    
                    if (aIsSenior && !bIsSenior) return -1;
                    if (!aIsSenior && bIsSenior) return 1;
                    
                    // If both have same title level, sort by callsign
                    return (a.callsign || '').localeCompare(b.callsign || '');
                });
            }
            
            // Sort members within SENIOR_EMT department: Advanced EMT first, then EMT
            if (deptKey === 'SENIOR_EMT') {
                deptMembers.sort((a, b) => {
                    const aIsAdvanced = (a.title === 'Advanced EMT');
                    const bIsAdvanced = (b.title === 'Advanced EMT');
                    
                    if (aIsAdvanced && !bIsAdvanced) return -1;
                    if (!aIsAdvanced && bIsAdvanced) return 1;
                    
                    // If both have same title level, sort by callsign
                    return (a.callsign || '').localeCompare(b.callsign || '');
                });
            }
            
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
    
    const memberInfo = `
📋 **معلومات العضو**

👤 **الاسم:** ${member.firstName || ''} ${member.lastName || ''}
💼 **المنصب:** ${member.title || ''}
🏥 **القسم:** ${DEPARTMENTS[member.department] || ''}
📞 **الرمز:** ${member.callsign || 'غير متوفر'}
💬 **ديسكورد:** ${member.discord || 'غير متوفر'}
📅 **تاريخ التوظيف:** ${member.hireDate || 'غير متوفر'}
🎖️ **آخر ترقية:** ${member.lastPromotion || 'غير متوفر'}
✈️ **MI:** ${member.mi ? '✅ متوفر' : '❌ غير متوفر'}
🚁 **AIR:** ${member.air ? '✅ متوفر' : '❌ غير متوفر'}
🚓 **FP:** ${member.fp ? '✅ متوفر' : '❌ غير متوفر'}
📝 **ملاحظات:** ${member.notes || 'لا توجد ملاحظات'}
    `;
    
    if (member.photo) {
        showCustomDialogWithImage(memberInfo, member.photo, `${member.firstName || ''} ${member.lastName || ''}`);
    } else {
        showCustomDialog(memberInfo, `${member.firstName || ''} ${member.lastName || ''}`);
    }
}

function closeMemberDetails() {
    closeCustomDialog();
}

function showCustomDialog(message, title = 'معلومات') {
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'custom-dialog-overlay';
    dialogOverlay.innerHTML = `
        <div class="custom-dialog">
            <div class="custom-dialog-header">
                <h3>${title}</h3>
                <button class="custom-dialog-close" onclick="closeCustomDialog()">×</button>
            </div>
            <div class="custom-dialog-body">
                <pre style="white-space: pre-wrap; font-family: 'Cairo', sans-serif; line-height: 1.6;">${message}</pre>
            </div>
            <div class="custom-dialog-footer">
                <button class="btn btn-primary" onclick="closeCustomDialog()">إغلاق</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialogOverlay);
    setTimeout(() => dialogOverlay.classList.add('active'), 10);
}

function showCustomDialogWithImage(message, imageUrl, title = 'معلومات') {
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'custom-dialog-overlay';
    dialogOverlay.innerHTML = `
        <div class="custom-dialog custom-dialog-with-image">
            <div class="custom-dialog-header">
                <h3>${title}</h3>
                <button class="custom-dialog-close" onclick="closeCustomDialog()">×</button>
            </div>
            <div class="custom-dialog-body">
                <div class="dialog-image-container">
                    <img src="${imageUrl}" alt="${title}" class="dialog-member-photo">
                </div>
                <div class="dialog-info">
                    <pre style="white-space: pre-wrap; font-family: 'Cairo', sans-serif; line-height: 1.6;">${message}</pre>
                </div>
            </div>
            <div class="custom-dialog-footer">
                <button class="btn btn-primary" onclick="closeCustomDialog()">إغلاق</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialogOverlay);
    setTimeout(() => dialogOverlay.classList.add('active'), 10);
}

function closeCustomDialog() {
    const dialog = document.querySelector('.custom-dialog-overlay');
    if (dialog) {
        dialog.classList.remove('active');
        setTimeout(() => dialog.remove(), 300);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderRoster();
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCustomDialog();
        }
    });
});
