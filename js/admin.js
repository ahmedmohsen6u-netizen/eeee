const DEPARTMENTS_MAP = {
    'MANAGEMENT_STAFF': 'MANGMENT STAFF',
    'HOSPITAL_SUPERVISOR': 'Hospital Supervisor',
    'HUMAN_RESOURCES': 'Human resources',
    'MEDICAL_DIRECTOR': 'Medical Director',
    'PARAMEDIC_SUPERVISOR': 'Paramedic Supervisor',
    'PARAMEDIC_OFFICER': 'Paramedic Officer/Lead Paramedic (Call signs From P-01 to P-20)',
    'CRITICAL_CARE': 'Critical Care Paramedic/Licensed Paramedic (Call signs From P-01 to P-20)',
    'SENIOR_PARAMEDICS': 'Senior Paramedics and Paramedics (Call signs From P-21 to P-39)',
    'SENIOR_EMT': 'Senior EMT and EMT (Call signs From E-40 to E-79)',
    'CADET_STUDENTS': 'Cadet / Students (Call Signs From C-80 to C-99)'
};

let currentEditMemberId = null;
let currentPhotoBase64 = null;
let editPhotoBase64 = null;

function checkAuth() {
    if (!sessionStorage.getItem('emsAdminSession')) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    sessionStorage.removeItem('emsAdminSession');
    window.location.href = 'login.html';
}

function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.classList.add('show');
    
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 5000);
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessageForm');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

function handleImageUpload(file, previewElementId, callback) {
    if (!file) {
        callback(null);
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showError('حجم الصورة كبير جداً. الحد الأقصى 5MB');
        callback(null);
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        
        const previewDiv = document.getElementById(previewElementId);
        previewDiv.innerHTML = `<img src="${base64}" style="max-width: 200px; max-height: 200px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);" alt="Preview">`;
        
        callback(base64);
    };
    
    reader.onerror = function() {
        showError('فشل تحميل الصورة');
        callback(null);
    };
    
    reader.readAsDataURL(file);
}

function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderAdminTable() {
    const members = getMembers();
    const tbody = document.getElementById('adminTableBody');
    
    if (!members || members.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-state">
                    <div>
                        <h3>لا توجد بيانات</h3>
                        <p>لم يتم إضافة أي أعضاء بعد</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    members.forEach(member => {
        html += `
            <tr class="fade-in">
                <td>${sanitizeHTML(member.firstName || '')}</td>
                <td>${sanitizeHTML(member.lastName || '')}</td>
                <td>${sanitizeHTML(member.title || '')}</td>
                <td>${sanitizeHTML(member.callsign || '')}</td>
                <td>${DEPARTMENTS_MAP[member.department] || member.department || ''}</td>
                <td>${sanitizeHTML(member.discord || '')}</td>
                <td><div class="checkbox-display ${member.mi ? 'checked' : ''}"></div></td>
                <td><div class="checkbox-display ${member.air ? 'checked' : ''}"></div></td>
                <td><div class="checkbox-display ${member.fp ? 'checked' : ''}"></div></td>
                <td class="action-buttons">
                    <button class="btn-edit" onclick="handleEditMember('${member.id}')">تعديل</button>
                    <button class="btn-delete" onclick="handleDeleteMember('${member.id}')">حذف</button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function handleAddMember() {
    const form = document.getElementById('addMemberForm');
    const formData = new FormData(form);
    
    const memberData = {
        firstName: formData.get('firstName').trim(),
        lastName: formData.get('lastName').trim(),
        title: formData.get('title').trim(),
        callsign: formData.get('callsign').trim(),
        hireDate: formData.get('hireDate'),
        lastPromotion: formData.get('lastPromotion'),
        discord: formData.get('discord').trim(),
        department: formData.get('department'),
        notes: formData.get('notes').trim(),
        mi: document.getElementById('mi').checked,
        air: document.getElementById('air').checked,
        fp: document.getElementById('fp').checked,
        photo: currentPhotoBase64 || ''
    };
    
    if (!memberData.firstName || !memberData.lastName) {
        showError('يرجى إدخال الاسم الأول والأخير');
        return;
    }
    
    if (!memberData.department) {
        showError('يرجى اختيار القسم');
        return;
    }
    
    try {
        addMember(memberData);
        showSuccess('تم إضافة العضو بنجاح');
        form.reset();
        document.getElementById('photoPreview').innerHTML = '';
        currentPhotoBase64 = null;
        renderAdminTable();
    } catch (error) {
        showError('حدث خطأ أثناء إضافة العضو');
        console.error(error);
    }
}

function handleEditMember(id) {
    const member = getMemberById(id);
    if (!member) {
        showError('العضو غير موجود');
        return;
    }
    
    currentEditMemberId = id;
    editPhotoBase64 = member.photo || null;
    
    document.getElementById('editMemberId').value = id;
    document.getElementById('editFirstName').value = member.firstName || '';
    document.getElementById('editLastName').value = member.lastName || '';
    document.getElementById('editTitle').value = member.title || '';
    document.getElementById('editCallsign').value = member.callsign || '';
    document.getElementById('editHireDate').value = member.hireDate || '';
    document.getElementById('editLastPromotion').value = member.lastPromotion || '';
    document.getElementById('editDiscord').value = member.discord || '';
    document.getElementById('editDepartment').value = member.department || '';
    document.getElementById('editNotes').value = member.notes || '';
    document.getElementById('editMi').checked = member.mi || false;
    document.getElementById('editAir').checked = member.air || false;
    document.getElementById('editFp').checked = member.fp || false;
    
    const editPhotoPreview = document.getElementById('editPhotoPreview');
    if (member.photo) {
        editPhotoPreview.innerHTML = `<img src="${member.photo}" style="max-width: 200px; max-height: 200px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);" alt="Current Photo">`;
    } else {
        editPhotoPreview.innerHTML = '';
    }
    
    const modal = document.getElementById('editModal');
    modal.classList.add('active');
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('active');
    currentEditMemberId = null;
    editPhotoBase64 = null;
    document.getElementById('editMemberForm').reset();
    document.getElementById('editPhotoPreview').innerHTML = '';
}

function handleUpdateMember() {
    if (!currentEditMemberId) {
        showError('معرف العضو غير موجود');
        return;
    }
    
    const form = document.getElementById('editMemberForm');
    const formData = new FormData(form);
    
    const memberData = {
        firstName: formData.get('firstName').trim(),
        lastName: formData.get('lastName').trim(),
        title: formData.get('title').trim(),
        callsign: formData.get('callsign').trim(),
        hireDate: formData.get('hireDate'),
        lastPromotion: formData.get('lastPromotion'),
        discord: formData.get('discord').trim(),
        department: formData.get('department'),
        notes: formData.get('notes').trim(),
        mi: document.getElementById('editMi').checked,
        air: document.getElementById('editAir').checked,
        fp: document.getElementById('editFp').checked,
        photo: editPhotoBase64 || ''
    };
    
    if (!memberData.firstName || !memberData.lastName) {
        showError('يرجى إدخال الاسم الأول والأخير');
        return;
    }
    
    if (!memberData.department) {
        showError('يرجى اختيار القسم');
        return;
    }
    
    try {
        updateMember(currentEditMemberId, memberData);
        showSuccess('تم تحديث بيانات العضو بنجاح');
        closeEditModal();
        renderAdminTable();
    } catch (error) {
        showError('حدث خطأ أثناء تحديث البيانات');
        console.error(error);
    }
}

function handleDeleteMember(id) {
    const member = getMemberById(id);
    if (!member) {
        showError('العضو غير موجود');
        return;
    }
    
    const confirmDelete = confirm(`هل أنت متأكد من حذف ${member.firstName} ${member.lastName}؟`);
    
    if (confirmDelete) {
        try {
            deleteMember(id);
            showSuccess('تم حذف العضو بنجاح');
            renderAdminTable();
        } catch (error) {
            showError('حدث خطأ أثناء حذف العضو');
            console.error(error);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    renderAdminTable();
    
    const addMemberForm = document.getElementById('addMemberForm');
    addMemberForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleAddMember();
    });
    
    const photoInput = document.getElementById('photo');
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file, 'photoPreview', function(base64) {
                currentPhotoBase64 = base64;
            });
        }
    });
    
    const editMemberForm = document.getElementById('editMemberForm');
    editMemberForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleUpdateMember();
    });
    
    const editPhotoInput = document.getElementById('editPhoto');
    editPhotoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file, 'editPhotoPreview', function(base64) {
                editPhotoBase64 = base64;
            });
        }
    });
    
    const editModal = document.getElementById('editModal');
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
});
