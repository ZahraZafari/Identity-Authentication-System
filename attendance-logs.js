
let simulatedUsers = [
    { id: 101, name: "علی احمدی", code: "101", role: "ادمین", status: true },
    { id: 102, name: "سارا رضایی", code: "102", role: "کاربر", status: false },
    { id: 105, name: "محمد حسینی", code: "105", role: "مسئول دفتر", status: true },
    { id: 4, name: "فاطمه کریمی", code: "108", role: "کاربر", status: true },
    { id: 5, name: "رضا محمودی", code: "110", role: "مسئول انتقال داده", status: true }
];
window.simulatedUsers = simulatedUsers;


let gCurrentUserRole = sessionStorage.getItem('currentUserRole') || 'ادمین';
window.gCurrentUserRole = gCurrentUserRole;



document.addEventListener('DOMContentLoaded', function() {
   
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const appContainer = document.getElementById('app-container');
    if (menuToggle && sidebar && appContainer) {
        function updateSidebarForViewport() {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                appContainer.classList.remove('sidebar-collapsed-desktop');
                menuToggle.setAttribute('aria-expanded', sidebar.classList.contains('open'));
            } else {
                sidebar.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', !appContainer.classList.contains('sidebar-collapsed-desktop'));
            }
        }
        menuToggle.addEventListener('click', function() {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                sidebar.classList.toggle('open');
                menuToggle.setAttribute('aria-expanded', sidebar.classList.contains('open'));
            } else {
                appContainer.classList.toggle('sidebar-collapsed-desktop');
                menuToggle.setAttribute('aria-expanded', !appContainer.classList.contains('sidebar-collapsed-desktop'));
            }
        });
        window.addEventListener('resize', updateSidebarForViewport);
        updateSidebarForViewport();
    }

    // --- اجرای کدهای مخصوص این صفحه ---
    setupAttendanceLogsPage();
});

// =====================================================================
// !! تابع اختصاصی برای صفحه گزارش تردد (Attendance Logs) !!
// =====================================================================
function setupAttendanceLogsPage() {
    console.log("Setting up Attendance Logs Page...");
    
    const currentUserRole = window.gCurrentUserRole || 'guest';
    const allowedRolesForPage = ['ادمین', 'مسئول انتقال داده', 'مسئول دفتر'];

    if (!allowedRolesForPage.includes(currentUserRole)) {
        const mainContent = document.getElementById('content');
        if (mainContent) {
            mainContent.innerHTML = `<div class="access-denied-container"><i class="fas fa-lock access-denied-icon"></i><h2 class="access-denied-title">دسترسی غیرمجاز</h2><p class="access-denied-message">شما دسترسی لازم برای مشاهده این صفحه را ندارید.</p><a href="index.html" class="btn btn-primary" style="margin-top: 15px;">بازگشت به صفحه اصلی</a></div>`;
        }
        return;
    }

    function applyRoleBasedVisibility() {
        const controlledElements = document.querySelectorAll('[data-role-access]');
        controlledElements.forEach(element => {
            const allowedRoles = element.dataset.roleAccess.split(',').map(role => role.trim());
            if (allowedRoles.includes(currentUserRole)) {
                element.style.display = '';
            } else {
                element.style.display = 'none';
            }
        });
    }
    applyRoleBasedVisibility();

    const userSelect = document.getElementById('report-user-select');
    const dateFromInput = document.getElementById('report-date-from');
    const dateToInput = document.getElementById('report-date-to');
    const reportTypeSelect = document.getElementById('report-type');
    const generateReportBtn = document.getElementById('btn-generate-report');
    const exportExcelBtn = document.getElementById('btn-export-excel');
    const resultsContainer = document.getElementById('report-results-container');
    const reportTableThead = document.querySelector('#attendance-report-table thead');
    const reportTableTbody = document.querySelector('#attendance-report-table tbody');
    const reportTableTfoot = document.querySelector('#attendance-report-table tfoot');
    const reportSummaryInfo = document.getElementById('report-summary-info');
    const chartsSection = document.getElementById('charts-section');
    const deviceStatusSection = document.getElementById('device-status-section');
    const chartCanvas = document.getElementById('myAttendanceChart'); 

    let myChartInstance = null; 
    const simulatedUsersDataForLogs = window.simulatedUsers || [];

    if (userSelect) {
         if (!userSelect.querySelector('option[value="all"]')) { 
            const allOption = document.createElement('option');
            allOption.value = "all";
            allOption.textContent = "همه کاربران";
            userSelect.insertBefore(allOption, userSelect.firstChild);
        }
        simulatedUsersDataForLogs.forEach(user => { 
            if (!userSelect.querySelector(`option[value="${user.id}"]`)) {
                const option = document.createElement('option'); 
                option.value = user.id; 
                option.textContent = `${user.name} (کد: ${user.code})`; 
                userSelect.appendChild(option); 
            }
        });
    }
    const today = new Date(); const firstDayOfWeek = new Date(today); firstDayOfWeek.setDate(today.getDate() - (today.getDay() === 6 ? -1 : today.getDay() + 1)); 
    if(dateFromInput) dateFromInput.valueAsDate = firstDayOfWeek; if(dateToInput) dateToInput.valueAsDate = today;

    function timeToMinutes(timeStr) { 
        if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 0; 
        const p = timeStr.split(':'); 
        const hours = parseInt(p[0],10);
        const minutes = parseInt(p[1],10);
        if (isNaN(hours) || isNaN(minutes)) return 0;
        return hours * 60 + minutes; 
    }
    function minutesToTime(totalMinutes) { 
        if (isNaN(totalMinutes) || typeof totalMinutes !== 'number') return "00:00";
        const h = Math.floor(totalMinutes/60); 
        const m = Math.round(totalMinutes%60); 
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; 
    }
    
    function getSimulatedAttendanceData(userId, fromDate, toDate) { 
        const data = []; 
        const usersToReportOn = userId === 'all' ? simulatedUsersDataForLogs : simulatedUsersDataForLogs.filter(u=> String(u.id) === String(userId)); 
        usersToReportOn.forEach(user => { 
            let dIter = new Date(fromDate); 
            while(dIter <= toDate){ 
                const eH=8+Math.floor(Math.random()*3); 
                const xH=16+Math.floor(Math.random()*3); 
                const lunch = Math.random()>.3?1:0; 
                const wH=Math.max(0, xH - eH - lunch); 
                const standardDay = 8; 

                data.push({
                    userId:user.id,
                    userName:user.name,
                    userCode:user.code,
                    date:dIter.toLocaleDateString('fa-IR',{year:'numeric',month:'2-digit',day:'2-digit'}),
                    entry: `${String(eH).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`, 
                    exit: `${String(xH).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,   
                    totalWork: `${wH} ساعت`, 
                    totalWorkHoursNumeric: wH,
                    shortageMinutes: Math.max(0, (standardDay - wH) * 60) + (eH > 9 ? (eH - 9) * 60 + Math.floor(Math.random() * 15) : 0),
                    overtimeMinutes: Math.max(0, (wH - standardDay) * 60) + (wH > standardDay ? Math.floor(Math.random()*60) : 0),
                    lateEntryMinutes: eH > 9 ? (eH - 9) * 60 + Math.floor(Math.random()*30) : 0,
                    earlyExitMinutes: xH < 17 ? (17 - xH) * 60 + Math.floor(Math.random()*30) : 0,
                    nightWorkMinutes: 0, 
                    holidayWorkHoursNumeric: (dIter.getDay()===4||dIter.getDay()===5)&&Math.random()>.8 ? wH : 0
                }); 
                dIter.setDate(dIter.getDate()+1);
            }
        });
        if (userId !== 'all') {
             data.sort((a,b)=>(new Date(a.date.split('/').reverse().join('-'))) - (new Date(b.date.split('/').reverse().join('-'))));
        }
        return data; 
    }
    
    function displayReport(data, reportType, selectedUserId, dateFrom, dateTo) { 
        if(!reportTableThead||!reportTableTbody||!reportTableTfoot||!resultsContainer||!reportSummaryInfo)return; 
        reportTableThead.innerHTML='';reportTableTbody.innerHTML='';reportTableTfoot.innerHTML=''; 
        resultsContainer.style.display='block';
        
        let summaryTxt = `گزارش برای ${selectedUserId!=='all'?`کاربر "${(simulatedUsersDataForLogs.find(u=> String(u.id) === String(selectedUserId))||{}).name||'ناشناس'}"`:'همه کاربران'} از تاریخ ${new Date(dateFrom).toLocaleDateString('fa-IR')} تا ${new Date(dateTo).toLocaleDateString('fa-IR')}`; 
        reportSummaryInfo.textContent=summaryTxt;reportSummaryInfo.style.display='block'; 
        
        if(!data || data.length===0){ 
            reportTableTbody.innerHTML='<tr><td colspan="12" class="text-center" style="padding:20px;">داده‌ای برای نمایش با این فیلترها یافت نشد.</td></tr>';
            if(chartsSection)chartsSection.style.display='none';return;
        } 
        
        let headers=[];
        if(reportType==='daily_detailed'||reportType==='today_all'||reportType==='all_users_daily_by_date'){
            headers=["نام کاربر","کد","تاریخ","ورود","خروج","کل کارکرد","کسر کار","اضافه کار","تاخیر ورود","تعجیل خروج","شب کاری","تعطیل کاری"];
        } else if(reportType==='user_summary_range'||reportType==='all_users_summary_range'){
            headers=["نام کاربر","کد","کل کارکرد","کل کسر کار","کل اضافه کار","کل تاخیر ورود","کل تعجیل خروج","کل شب کاری","کل تعطیل کاری"];
        } 
        
        const trH=document.createElement('tr');
        headers.forEach(t=>{const th=document.createElement('th');th.textContent=t;trH.appendChild(th);});
        reportTableThead.appendChild(trH); 
        
        let grandTotals = { workHours: 0, shortageMinutes: 0, overtimeMinutes: 0, lateEntryMinutes: 0, earlyExitMinutes: 0, nightWorkMinutes: 0, holidayWorkHours: 0 };

        if(reportType==='daily_detailed'||reportType==='today_all'||reportType==='all_users_daily_by_date'){
             if (reportType === 'all_users_daily_by_date') { 
                data.sort((a,b) => (new Date(a.date.split('/').reverse().join('-'))) - (new Date(b.date.split('/').reverse().join('-'))) || a.userName.localeCompare(b.userName));
            }
            data.forEach(r=>{
                const tr=document.createElement('tr');
                tr.innerHTML=`<td>${r.userName}</td><td>${r.userCode}</td><td>${r.date}</td><td>${r.entry}</td><td>${r.exit}</td><td>${r.totalWorkHoursNumeric.toFixed(1)} ساعت</td><td>${minutesToTime(r.shortageMinutes)}</td><td>${minutesToTime(r.overtimeMinutes)}</td><td>${minutesToTime(r.lateEntryMinutes)}</td><td>${minutesToTime(r.earlyExitMinutes)}</td><td>${minutesToTime(r.nightWorkMinutes)}</td><td>${r.holidayWorkHoursNumeric.toFixed(1)} ساعت</td>`;
                reportTableTbody.appendChild(tr);
                grandTotals.workHours += r.totalWorkHoursNumeric; grandTotals.shortageMinutes += r.shortageMinutes; grandTotals.overtimeMinutes += r.overtimeMinutes; grandTotals.lateEntryMinutes += r.lateEntryMinutes; grandTotals.earlyExitMinutes += r.earlyExitMinutes; grandTotals.nightWorkMinutes += r.nightWorkMinutes; grandTotals.holidayWorkHours += r.holidayWorkHoursNumeric;
            });
        } else if(reportType==='user_summary_range'||reportType==='all_users_summary_range'){
            const uS={};
            data.forEach(d=>{
                if(!uS[d.userId])uS[d.userId]={userName:d.userName,userCode:d.userCode,totalWorkHoursNumeric:0,totalShortageMinutes:0,totalOvertimeMinutes:0,totalLateEntryMinutes:0,totalEarlyExitMinutes:0,totalNightWorkMinutes:0,totalHolidayWorkHoursNumeric:0};
                uS[d.userId].totalWorkHoursNumeric+=d.totalWorkHoursNumeric;
                uS[d.userId].totalShortageMinutes+=d.shortageMinutes;
                uS[d.userId].totalOvertimeMinutes+=d.overtimeMinutes;
                uS[d.userId].totalLateEntryMinutes+=d.lateEntryMinutes;
                uS[d.userId].totalEarlyExitMinutes+=d.earlyExitMinutes;
                uS[d.userId].totalNightWorkMinutes+=d.nightWorkMinutes;
                uS[d.userId].totalHolidayWorkHoursNumeric+=d.holidayWorkHoursNumeric;
            });
            for(const id in uS){
                const s=uS[id];
                const tr=document.createElement('tr');
                tr.innerHTML=`<td>${s.userName}</td><td>${s.userCode}</td><td>${s.totalWorkHoursNumeric.toFixed(1)} ساعت</td><td>${minutesToTime(s.totalShortageMinutes)}</td><td>${minutesToTime(s.totalOvertimeMinutes)}</td><td>${minutesToTime(s.totalLateEntryMinutes)}</td><td>${minutesToTime(s.totalEarlyExitMinutes)}</td><td>${minutesToTime(s.totalNightWorkMinutes)}</td><td>${s.totalHolidayWorkHoursNumeric.toFixed(1)} ساعت</td>`;
                reportTableTbody.appendChild(tr);
                grandTotals.workHours += s.totalWorkHoursNumeric; grandTotals.shortageMinutes += s.totalShortageMinutes; grandTotals.overtimeMinutes += s.totalOvertimeMinutes; grandTotals.lateEntryMinutes += s.totalLateEntryMinutes; grandTotals.earlyExitMinutes += s.totalEarlyExitMinutes; grandTotals.nightWorkMinutes += s.totalNightWorkMinutes; grandTotals.holidayWorkHours += s.totalHolidayWorkHoursNumeric;
            }
        } 
        
        if (headers.length > 0 && data.length > 0) {
            const trF = document.createElement('tr');
            trF.classList.add('total-summary-row');
            let footerHTML = '';
            let colspanBase = 0;
            if (reportType === 'daily_detailed' || reportType === 'today_all' || reportType === 'all_users_daily_by_date') {
                colspanBase = 5; 
            } else if (reportType === 'user_summary_range' || reportType === 'all_users_summary_range') {
                colspanBase = 2; 
            } else { colspanBase = 1; }
            footerHTML += `<td colspan="${colspanBase}">جمع کل:</td>`;
            footerHTML += `<td>${grandTotals.workHours.toFixed(1)} ساعت</td>`;
            footerHTML += `<td>${minutesToTime(grandTotals.shortageMinutes)}</td>`;
            footerHTML += `<td>${minutesToTime(grandTotals.overtimeMinutes)}</td>`;
            footerHTML += `<td>${minutesToTime(grandTotals.lateEntryMinutes)}</td>`;
            footerHTML += `<td>${minutesToTime(grandTotals.earlyExitMinutes)}</td>`;
            footerHTML += `<td>${minutesToTime(grandTotals.nightWorkMinutes)}</td>`;
            footerHTML += `<td>${grandTotals.holidayWorkHours.toFixed(1)} ساعت</td>`;
            trF.innerHTML = footerHTML;
            reportTableTfoot.appendChild(trF);
        }
        
        const chartPlaceholderDiv = document.getElementById('attendance-chart-placeholder');
        
        if (chartsSection) chartsSection.style.display = 'block'; 

        if (chartCanvas && typeof Chart !== 'undefined') {
            const ctx = chartCanvas.getContext('2d');

            if (myChartInstance) { 
                myChartInstance.destroy();
                myChartInstance = null;
            }

            let chartConfigData = { labels: [], datasets: [{ label: 'میزان (ساعت)', data: [], backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }] };
            let chartTitle = `نمودار گزارش`; let chartType = 'bar'; let chartDataAvailable = false;

            if (reportType === 'all_users_summary_range' && data.length > 0) { 
                chartTitle = `خلاصه کارکرد همه کاربران`;
                chartConfigData.datasets[0].label = 'کل کارکرد (ساعت)';
                const userSummariesForChart = {};
                data.forEach(d => { if (!userSummariesForChart[d.userId]) { userSummariesForChart[d.userId] = { userName: d.userName, totalWorkHoursNumericValue: 0 }; } userSummariesForChart[d.userId].totalWorkHoursNumericValue += d.totalWorkHoursNumeric; });
                for (const id in userSummariesForChart) { chartConfigData.labels.push(userSummariesForChart[id].userName); chartConfigData.datasets[0].data.push(userSummariesForChart[id].totalWorkHoursNumericValue.toFixed(1)); }
                if (chartConfigData.labels.length > 0) chartDataAvailable = true;
            } else if (reportType === 'user_summary_range' && selectedUserId !== 'all' && data.length > 0) { 
                chartTitle = `خلاصه کارکرد کاربر: ${data.length > 0 ? data[0].userName : ''}`; 
                chartConfigData.datasets[0].label = 'کل کارکرد (ساعت)';
                let totalWorkForSingleUser = 0; data.forEach(d => { totalWorkForSingleUser += d.totalWorkHoursNumeric; });
                if (data.length > 0) { chartConfigData.labels.push(data[0].userName); chartConfigData.datasets[0].data.push(totalWorkForSingleUser.toFixed(1)); chartDataAvailable = true; }
            } else if (reportType === 'daily_detailed' && selectedUserId !== 'all' && data.length > 0) {
                chartType = 'line'; chartTitle = `روند کارکرد روزانه ${data[0].userName}`;
                chartConfigData.datasets[0].label = 'کارکرد روزانه (ساعت)';
                chartConfigData.datasets[0].borderColor = 'rgba(255, 99, 132, 1)';
                chartConfigData.datasets[0].backgroundColor = 'rgba(255, 99, 132, 0.2)';
                data.forEach(r => { chartConfigData.labels.push(r.date); chartConfigData.datasets[0].data.push(r.totalWorkHoursNumeric.toFixed(1)); });
                if (chartConfigData.labels.length > 0) chartDataAvailable = true;
            }

            if (chartDataAvailable) {
                if (chartPlaceholderDiv) { chartPlaceholderDiv.innerHTML = ''; if (!chartPlaceholderDiv.contains(chartCanvas)) { chartPlaceholderDiv.appendChild(chartCanvas); } }
                myChartInstance = new Chart(ctx, { type: chartType, data: chartConfigData, options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: chartTitle, font: { size: 16, family: 'Tahoma' } }, legend: { labels: { font: { family: 'Tahoma' } } } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'ساعت', font: { family: 'Tahoma' } }, ticks: { font: { family: 'Tahoma' } } }, x: { ticks: { font: { family: 'Tahoma' } } } } } });
            } else { if (chartPlaceholderDiv) chartPlaceholderDiv.innerHTML = '<p>نموداری برای این نوع گزارش تعریف نشده یا داده کافی نیست.</p>'; }
        } else { if (chartPlaceholderDiv) chartPlaceholderDiv.innerHTML = '<p>خطا در بارگذاری نمودار. کتابخانه یا عنصر Canvas یافت نشد.</p>'; }
    }

    if(generateReportBtn){generateReportBtn.addEventListener('click',function(){const sId=userSelect.value,f=dateFromInput.value,t=dateToInput.value,type=reportTypeSelect.value;if(!f||!t){alert("لطفاً بازه زمانی را مشخص کنید.");return;}if(new Date(f)>new Date(t)){alert("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.");return;}const rD=getSimulatedAttendanceData(sId,new Date(f),new Date(t));displayReport(rD,type,sId,f,t);});}
    if(exportExcelBtn)exportExcelBtn.addEventListener('click',function(){alert(' دریافت فایل اکسل. در نسخه واقعی، داده‌های جدول به اکسل صادر می‌شوند.');});
    
    let simulatedSystemLogs = [ { type: 'error', icon: 'fas fa-exclamation-circle', message: 'خطا در اتصال به سرور بروزرسانی.', timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString('fa-IR', {hour12: false}) }, { type: 'auth-failure', icon: 'fas fa-user-times', message: "تلاش برای ورود با نام کاربری 'testuser' ناموفق بود.", timestamp: new Date(Date.now() - 3600000 * 1.5).toLocaleString('fa-IR', {hour12: false}), detailsLink: '#' , detailsText: "مشاهده تصویر (شبیه‌سازی)"}, { type: 'usb-event', icon: 'fab fa-usb', message: "دستگاه USB 'SanDisk 32GB' متصل شد.", timestamp: new Date(Date.now() - 3600000 * 1).toLocaleString('fa-IR', {hour12: false}) }, { type: 'info', icon: 'fas fa-info-circle', message: 'سیستم با موفقیت راه‌اندازی شد.', timestamp: new Date(Date.now() - 3600000 * 5).toLocaleString('fa-IR', {hour12: false}) }, { type: 'warning', icon: 'fas fa-exclamation-triangle', message: 'حافظه دستگاه رو به اتمام است (85% پر).', timestamp: new Date(Date.now() - 3600000 * 0.5).toLocaleString('fa-IR', {hour12: false}) }, { type: 'usb-event', icon: 'fab fa-usb', message: "دستگاه USB 'SanDisk 32GB' قطع شد.", timestamp: new Date(Date.now() - 3600000 * 0.2).toLocaleString('fa-IR', {hour12: false}) }, ];

    function renderSystemLogs(logs) {
        const container = document.getElementById('system-logs-list-container');
        if (!container) { return; }
        const emptyMessage = container.querySelector('.log-list-empty');
        
        container.querySelectorAll('.log-item').forEach(item => container.removeChild(item));
        if (!logs || logs.length === 0) { if (emptyMessage) emptyMessage.style.display = 'block'; return; }
        if (emptyMessage) emptyMessage.style.display = 'none';

        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        logs.forEach(log => {
            const logItemDiv = document.createElement('div'); logItemDiv.classList.add('log-item');
            let typeText = 'اطلاعات', typeClass = 'log-info'; 
            if (log.type === 'error') { typeText = 'خطای سیستم'; typeClass = 'log-error'; }
            else if (log.type === 'warning') { typeText = 'هشدار'; typeClass = 'log-warning'; }
            else if (log.type === 'auth-failure') { typeText = 'ورود ناموفق'; typeClass = 'log-auth-failure'; }
            else if (log.type === 'usb-event') { typeText = 'رویداد USB'; typeClass = 'log-usb'; }

            logItemDiv.innerHTML = ` <div class="log-icon ${typeClass}"><i class="${log.icon || 'fas fa-info-circle'}"></i></div> <div class="log-content"> <div class="log-header"> <span class="log-type ${typeClass}">${typeText}</span> <span class="log-timestamp">${log.timestamp}</span> </div> <div class="log-message">${log.message}</div> ${log.detailsLink ? `<div class="log-details"><a href="${log.detailsLink}" onclick="event.preventDefault(); alert('نمایش تصویر شبیه‌سازی شده برای لاگ.')">${log.detailsText || 'جزئیات بیشتر'}</a></div>` : ''} </div> `;
            container.appendChild(logItemDiv);
        });
    }
    
    if (document.getElementById('system-logs-section') && document.getElementById('system-logs-section').style.display !== 'none') { renderSystemLogs(simulatedSystemLogs); }
    const btnClearLogs = document.getElementById('btn-clear-simulated-logs');
    if (btnClearLogs) { btnClearLogs.addEventListener('click', function() { if (confirm("آیا از پاکسازی لاگ‌های شبیه‌سازی شده مطمئن هستید؟")) { simulatedSystemLogs = []; renderSystemLogs(simulatedSystemLogs); alert("لاگ‌های شبیه‌سازی شده پاک شدند."); } }); }

    if(deviceStatusSection && deviceStatusSection.style.display !== 'none'){
        const els={u:document.getElementById('device-registered-users'),e:document.getElementById('device-last-export'),s:document.getElementById('device-last-sync')};
        if(els.u)els.u.textContent=window.simulatedUsers?window.simulatedUsers.length:0;
        if(els.e)els.e.textContent=`${new Date(Date.now()-Math.random()*1e9).toLocaleDateString('fa-IR')} (کاربر: ادمین)`;
        if(els.s)els.s.textContent=`${new Date(Date.now()-Math.random()*5e8).toLocaleDateString('fa-IR')} (نحوه: خودکار)`;
    }
}