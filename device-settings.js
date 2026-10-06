

let simulatedUsers = [
    { id: 101, name: "علی احمدی", code: "101", role: "ادمین", status: true },
    { id: 102, name: "سارا رضایی", code: "102", role: "کاربر", status: false },
    { id: 105, name: "محمد حسینی", code: "105", role: "مسئول واحد", status: true },
    { id: 4, name: "فاطمه کریمی", code: "108", role: "کاربر", status: true },
    { id: 5, name: "رضا محمودی", code: "110", role: "مسئول انتقال داده", status: true }
];
window.simulatedUsers = simulatedUsers;

let gCurrentUserRole = sessionStorage.getItem('currentUserRole') || 'کاربر';
window.gCurrentUserRole = gCurrentUserRole;

let simulatedShifts = [
    { id: 1, name: "شیفت صبح", from: "08:00", to: "16:00" },
    { id: 2, name: "شیفت عصر", from: "14:00", to: "22:00" },
    { id: 3, name: "اداری", from: "08:30", to: "17:00" },
];

let simulatedHolidays = [
    { id: 10, date: "1403-01-01", name: "نوروز" },
    { id: 11, date: "1403-03-14", name: "رحلت امام خمینی (ره)" },
];

// داده جدید برای نقش‌ها
let simulatedRoles = [
    { id: 1, name: "ادمین" },
    { id: 2, name: "کاربر" },
    { id: 3, name: "مسئول واحد" },
    { id: 4, name: "مسئول انتقال داده" }
];


function editUser(userId) {
    const user = window.simulatedUsers.find(u => u.id === userId);
    if (user) {
        alert(`ویرایش کاربر: ${user.name} (ID: ${userId}) (شبیه‌سازی).\nیک فرم با اطلاعات کاربر برای ویرایش نمایش داده می‌شود.`);
    }
}

function toggleUserStatus(userId) {
    const user = window.simulatedUsers.find(u => u.id === userId);
    if (user) {
        user.status = !user.status;
        alert(`وضعیت کاربر ${user.name} به ${user.status ? 'فعال' : 'غیرفعال'} تغییر کرد (شبیه‌سازی).`);
        if (typeof window.renderUserList === 'function') {
            window.renderUserList();
        }
    }
}

function deleteUser(userId) {
    let user = window.simulatedUsers.find(u => u.id === userId);
    if (user) {
        if (confirm(`آیا از حذف کاربر ${user.name} مطمئن هستید؟`)) {
            window.simulatedUsers = window.simulatedUsers.filter(u => u.id !== userId);
            alert(`کاربر ${user.name} حذف شد (شبیه‌سازی).`);
            if (typeof window.renderUserList === 'function') window.renderUserList();
        }
    }
}

function searchUsers() {
    const searchInput = document.getElementById('user-search-input');
    if (!searchInput) return;
    const searchTerm = searchInput.value.toLowerCase().trim();
    const users = window.simulatedUsers || [];
    if (!searchTerm) {
        window.renderUserList(users);
        return;
    }
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.code.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm)
    );
    window.renderUserList(filteredUsers);
}

// تغییر در این تابع برای اتصال به صفحه جدید
window.openAddUserModal = function() {
    window.location.href = 'Identity_Employee.html';
};

// --- توابع جدید برای مدیریت نقش‌ها ---
function openRoleModal() {
    const modal = document.getElementById('role-management-modal');
    if (modal) {
        modal.classList.remove('hidden');
        renderRoles();
    }
}

function closeRoleModal() {
    const modal = document.getElementById('role-management-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function renderRoles() {
    const roleListDiv = document.getElementById('role-list');
    if (!roleListDiv) return;
    roleListDiv.innerHTML = '';
    simulatedRoles.forEach(role => {
        const isProtected = role.name === 'ادمین';
        roleListDiv.innerHTML += `
            <div class="role-item">
                <span>${role.name}</span>
                <div class="action-buttons">
                    ${isProtected ? '' : `<button class="edit-btn" onclick="alert('ویرایش نقش ${role.name}')" title="ویرایش"><i class="fas fa-edit"></i></button>`}
                    ${isProtected ? '' : `<button class="delete-btn" onclick="deleteRole(${role.id})" title="حذف"><i class="fas fa-trash-alt"></i></button>`}
                </div>
            </div>
        `;
    });
}

function addNewRole() {
    const nameInput = document.getElementById('new-role-name');
    const name = nameInput.value.trim();
    if (!name) {
        alert('لطفاً نام نقش را وارد کنید.');
        return;
    }
    const newRole = { id: Date.now(), name: name };
    simulatedRoles.push(newRole);
    renderRoles();
    nameInput.value = '';
}

function deleteRole(roleId) {
    if (confirm("آیا از حذف این نقش مطمئن هستید؟")) {
        simulatedRoles = simulatedRoles.filter(role => role.id !== roleId);
        renderRoles();
    }
}

// --- توابع دیگر (بدون تغییر) ---
function toggleNetworkSettings(mode) {
    const wifiSettings = document.getElementById('wifi-settings');
    const lanSettings = document.getElementById('lan-settings');
    if (wifiSettings && lanSettings) {
        if (mode === 'wifi') {
            wifiSettings.classList.remove('hidden');
            lanSettings.classList.add('hidden');
        } else if (mode === 'lan') {
            wifiSettings.classList.add('hidden');
            lanSettings.classList.remove('hidden');
        }
    }
}
function syncTimeWithServer() {
    alert('در حال همگام‌سازی ساعت با سرور... (شبیه‌سازی)');
    setTimeout(() => {
        alert('همگام‌سازی ساعت و تاریخ با موفقیت انجام شد.');
    }, 1500);
}
function saveManualDateTime() {
    const dateInput = document.getElementById('manual-date-input');
    const timeInput = document.getElementById('manual-time-input');
    if (dateInput.value && timeInput.value) {
        alert(`ساعت و تاریخ به صورت دستی ذخیره شد: \nتاریخ: ${dateInput.value}\nساعت: ${timeInput.value}`);
    } else {
        alert('لطفاً تاریخ و ساعت را به طور کامل وارد کنید.');
    }
}
function showShiftManagement(btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const contentArea = document.getElementById('shift-calendar-content');
    contentArea.innerHTML = ` <div id="shift-list"></div> <hr class="card-divider"> <h4>افزودن شیفت جدید</h4> <div class="add-new-form"> <input type="text" id="new-shift-name" placeholder="نام شیفت" class="form-control"> <input type="time" id="new-shift-from" class="form-control"> <input type="time" id="new-shift-to" class="form-control"> <button class="btn btn-success" onclick="addNewShift()">افزودن</button> </div> `;
    renderShifts();
}
function showCalendarManagement(btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const contentArea = document.getElementById('shift-calendar-content');
    contentArea.innerHTML = ` <div id="holiday-list"></div> <hr class="card-divider"> <h4>افزودن روز تعطیل جدید</h4> <div class="add-new-form"> <input type="text" id="new-holiday-name" placeholder="مناسبت" class="form-control"> <input type="date" id="new-holiday-date" class="form-control"> <button class="btn btn-success" onclick="addNewHoliday()">افزودن</button> </div> `;
    renderHolidays();
}
function addNewShift() {
    const nameInput = document.getElementById('new-shift-name'); const fromInput = document.getElementById('new-shift-from'); const toInput = document.getElementById('new-shift-to'); const name = nameInput.value.trim(); const from = fromInput.value; const to = toInput.value;
    if (!name || !from || !to) { alert('لطفاً تمام فیلدهای شیفت را پر کنید.'); return; }
    const newShift = { id: Date.now(), name: name, from: from, to: to };
    simulatedShifts.push(newShift);
    renderShifts();
    nameInput.value = ''; fromInput.value = ''; toInput.value = '';
}
function addNewHoliday() {
    const nameInput = document.getElementById('new-holiday-name'); const dateInput = document.getElementById('new-holiday-date'); const name = nameInput.value.trim(); const date = dateInput.value;
    if (!name || !date) { alert('لطفاً نام مناسبت و تاریخ را مشخص کنید.'); return; }
    const newHoliday = { id: Date.now(), name: name, date: date };
    simulatedHolidays.push(newHoliday);
    renderHolidays();
    nameInput.value = ''; dateInput.value = '';
}
function deleteShift(shiftId) {
    if (confirm("آیا از حذف این شیفت مطمئن هستید؟")) {
        simulatedShifts = simulatedShifts.filter(shift => shift.id !== shiftId);
        renderShifts();
    }
}
function deleteHoliday(holidayId) {
    if (confirm("آیا از حذف این روز تعطیل مطمئن هستید؟")) {
        simulatedHolidays = simulatedHolidays.filter(holiday => holiday.id !== holidayId);
        renderHolidays();
    }
}
function renderShifts() {
    const listDiv = document.getElementById('shift-list');
    listDiv.innerHTML = '';
    simulatedShifts.forEach(shift => {
        listDiv.innerHTML += `
            <div class="shift-item">
                <span>${shift.name} (از ${shift.from} تا ${shift.to})</span>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="alert('ویرایش شیفت ${shift.name}')" title="ویرایش"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteShift(${shift.id})" title="حذف"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    });
}
function renderHolidays() {
    const listDiv = document.getElementById('holiday-list');
    listDiv.innerHTML = '';
    simulatedHolidays.forEach(holiday => {
        listDiv.innerHTML += `
            <div class="holiday-item">
                <span>${holiday.name} - ${new Date(holiday.date).toLocaleDateString('fa-IR')}</span>
                <div class="action-buttons">
                    <button class="delete-btn" onclick="deleteHoliday(${holiday.id})" title="حذف"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    });
}

// --------------------------------------------------------------------------
// Event Listener اصلی و تابع راه‌انداز صفحه
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    // کد مربوط به سایدبار (بدون تغییر)
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const appContainer = document.getElementById('app-container');
    if (menuToggle && sidebar && appContainer) {
        function updateSidebarForViewport() {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) { appContainer.classList.remove('sidebar-collapsed-desktop'); menuToggle.setAttribute('aria-expanded', sidebar.classList.contains('open')); } else { sidebar.classList.remove('open'); menuToggle.setAttribute('aria-expanded', !appContainer.classList.contains('sidebar-collapsed-desktop')); }
        }
        menuToggle.addEventListener('click', function() {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) { sidebar.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', sidebar.classList.contains('open')); } else { appContainer.classList.toggle('sidebar-collapsed-desktop'); menuToggle.setAttribute('aria-expanded', !appContainer.classList.contains('sidebar-collapsed-desktop')); }
        });
        window.addEventListener('resize', updateSidebarForViewport);
        updateSidebarForViewport();
    }
    
    setupDeviceSettingsPage();
    
    if (document.querySelector('.tab-btn')) {
        showShiftManagement(document.querySelector('.tab-btn'));
    }

    // کد جدید برای بستن مودال با کلیک بیرون از آن
    const modal = document.getElementById('role-management-modal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeRoleModal();
            }
        });
    }
});

function setupDeviceSettingsPage() {
    console.log("راه‌اندازی صفحه تنظیمات دستگاه...");
    
    function applyRoleBasedAccess(currentUserRole) {
        const allCards = document.querySelectorAll('.settings-card');
        allCards.forEach(card => {
            const allowedRolesString = card.dataset.roleAccess;
            if (!allowedRolesString) { card.style.display = 'block'; return; }
            const allowedRolesArray = allowedRolesString.split(',');
            if (allowedRolesArray.includes(currentUserRole)) { card.style.display = 'block'; } else { card.style.display = 'none'; }
        });
    }
    
    applyRoleBasedAccess(window.gCurrentUserRole);
    
    if (document.getElementById('simulated-user-list')) {
        window.renderUserList();
    }
    
    const correctionUserSelect = document.getElementById('correction-user-select');
    if (correctionUserSelect && correctionUserSelect.closest('.settings-card').style.display !== 'none') {
        correctionUserSelect.innerHTML = '';
        window.simulatedUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name} (کد: ${user.code})`;
            correctionUserSelect.appendChild(option);
        });
    }
}

window.renderUserList = function(usersToRender = window.simulatedUsers) {
    const userListElement = document.getElementById('simulated-user-list');
    const emptyListMessage = document.querySelector('.user-list-empty');
    if (!userListElement) return;
    if (userListElement.closest('.settings-card').style.display === 'none') return;
    userListElement.innerHTML = '';
    if (!usersToRender || usersToRender.length === 0) { if(emptyListMessage) emptyListMessage.style.display = 'block'; return; }
    if(emptyListMessage) emptyListMessage.style.display = 'none';
    
    usersToRender.forEach(user => {
        const listItem = document.createElement('li');
        listItem.setAttribute('data-user-id', user.id);
        const statusIconClass = user.status ? 'fa-toggle-on status-active' : 'fa-toggle-off status-inactive';
        const statusTitle = user.status ? 'تغییر به غیرفعال' : 'تغییر به فعال';

        listItem.innerHTML = `
            <div class="user-details">
                <span>${user.name} (کد: ${user.code})</span>
            </div>
            <div class="user-actions">
                <span class="role-tag">${user.role}</span>
                <div class="action-icons">
                    <button title="حذف" class="danger" onclick="deleteUser(${user.id})"><i class="fas fa-trash-alt"></i></button>
                    <button title="${statusTitle}" onclick="toggleUserStatus(${user.id})"><i class="fas ${statusIconClass}"></i></button>
                    <button title="ویرایش" onclick="editUser(${user.id})"><i class="fas fa-edit"></i></button>
                </div>
            </div>
        `;
        userListElement.appendChild(listItem);
    });
};