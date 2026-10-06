document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const appContainer = document.getElementById('app-container');

    function updateSidebarForViewport() {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            appContainer.classList.remove('sidebar-collapsed-desktop');
            // در موبایل، سایدبار در ابتدا باید بسته باشد اگر صفحه رفرش شود
            // اما اگر کاربر آن را باز کرده، وضعیتش حفظ شود
            // اگر sidebar.classList.contains('open') باشد، یعنی کاربر آن را باز کرده
            // در غیر این صورت، آن را ببند
            if (!sidebar.classList.contains('open')) {
                 sidebar.classList.remove('open');
            }
            menuToggle.setAttribute('aria-expanded', sidebar.classList.contains('open'));
        } else { // دسکتاپ
            sidebar.classList.remove('open'); // در دسکتاپ منوی موبایل را همیشه ببند
            menuToggle.setAttribute('aria-expanded', !appContainer.classList.contains('sidebar-collapsed-desktop'));
        }
    }

    menuToggle.addEventListener('click', function() {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            sidebar.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', sidebar.classList.contains('open'));
        } else { // دسکتاپ
            appContainer.classList.toggle('sidebar-collapsed-desktop');
            menuToggle.setAttribute('aria-expanded', !appContainer.classList.contains('sidebar-collapsed-desktop'));
        }
    });

    // اجرای اولیه و هنگام تغییر اندازه صفحه
    window.addEventListener('resize', updateSidebarForViewport);
    updateSidebarForViewport(); // فراخوانی اولیه برای تنظیم حالت صحیح

    // --- توابع و منطق برای صفحه Stand By ---
    function setupStandByPage() {
        const currentTimeSpan = document.getElementById('current-time');
        const currentDateSpan = document.getElementById('current-date');
        const dynamicMessageP = document.getElementById('dynamic-message');

        // اگر عناصر مربوط به صفحه Stand By وجود ندارند، یعنی در این صفحه نیستیم
        if (!currentTimeSpan || !currentDateSpan || !dynamicMessageP) {
            return;
        }

        const messages = [
            "به داشبورد خود خوش آمدید!",
            "یک روز پر انرژی را برایتان آرزومندیم.",
            "همیشه می‌توانید از بخش راهنما کمک بگیرید.",
            "کارهایتان را با برنامه‌ریزی پیش ببرید.",
            "برای موفقیت امروز تلاش کنید!",
            "با تلاش مستمر به اهدافتان می‌رسید.",
            "دانش، قدرت است.",
            "ما هر روز در حال بهبود هستیم."
        ];

        function updateDateTime() {
            const now = new Date();
            const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
            const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

            const timeString = now.toLocaleTimeString('fa-IR', timeOptions);
            const dateString = now.toLocaleDateString('fa-IR', dateOptions);

            currentTimeSpan.textContent = timeString;
            currentDateSpan.textContent = dateString;
        }

        let currentMessageIndex = 0;
        function displayNextMessage() {
            dynamicMessageP.textContent = messages[currentMessageIndex];
            currentMessageIndex = (currentMessageIndex + 1) % messages.length;
        }

        // فراخوانی اولیه
        updateDateTime();
        displayNextMessage();

        // به‌روزرسانی ساعت و تاریخ هر ثانیه
        setInterval(updateDateTime, 1000);
        // تغییر پیام هر 7 ثانیه
        setInterval(displayNextMessage, 7000);
    }

    // --- توابع و منطق برای صفحه Face Detection ---
    let stream; // برای نگهداری جریان دوربین
    let messageTimeout; // برای پاک کردن پیام بعد از چند ثانیه

    function setupFaceDetectionPage() {
        const webcamFeed = document.getElementById('webcam-feed');
        const cameraTimeSpan = document.getElementById('camera-current-time');
        const cameraDateSpan = document.getElementById('camera-current-date');
        const connectionStatusIcon = document.getElementById('connection-status-icon');
        const detectionMessageDiv = document.getElementById('face-detection-message');
        const detectionMessageText = detectionMessageDiv ? detectionMessageDiv.querySelector('.message-text') : null;
        const userRoleOptionsContainer = document.getElementById('user-role-options');
        const welcomeMessageBox = userRoleOptionsContainer ? userRoleOptionsContainer.querySelector('.welcome-box') : null;
        const welcomeMessageText = welcomeMessageBox ? welcomeMessageBox.querySelector('.welcome-message') : null;
        const correctionOptionsDiv = welcomeMessageBox ? welcomeMessageBox.querySelector('.correction-options') : null;

        // اگر عناصر مربوط به صفحه Face Detection وجود ندارند، یعنی در این صفحه نیستیم
        if (!webcamFeed || !cameraTimeSpan || !cameraDateSpan || !connectionStatusIcon || !detectionMessageDiv || !userRoleOptionsContainer) {
            return;
        }

        // شبیه‌سازی نقش کاربر (می‌توانید 'admin', 'manager', 'user', 'guest' را امتحان کنید)
        let currentUserRole = 'guest'; 

        // 1. نمایش تصویر زنده دوربین
        async function startCamera() {
            try {
                // 'user' برای دوربین سلفی/جلو، 'environment' برای دوربین پشت
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }); 
                webcamFeed.srcObject = stream;
                webcamFeed.onloadedmetadata = () => {
                    webcamFeed.play();
                    console.log('Camera started successfully.');
                };
            } catch (err) {
                console.error("خطا در دسترسی به دوربین:", err);
                if (webcamFeed) webcamFeed.style.display = 'none';
                showMessage("خطا: دسترسی به دوربین ممکن نیست یا توسط کاربر مسدود شده است.", 'error', 0); // 0 به معنی ماندگار بودن پیام
            }
        }

        // توقف دوربین هنگام ترک صفحه
        function stopCamera() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                console.log('Camera stopped.');
            }
        }
        window.addEventListener('beforeunload', stopCamera);


        // 2. نمایش ساعت و تاریخ در حاشیه تصویر
        function updateCameraDateTime() {
            const now = new Date();
            const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
            const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }; 

            const timeString = now.toLocaleTimeString('fa-IR', timeOptions);
            const dateString = now.toLocaleDateString('fa-IR', dateOptions);

            cameraTimeSpan.textContent = timeString;
            cameraDateSpan.textContent = dateString;
        }

        // 3. نمایش علامت ارتباط به شبکه
        function updateConnectionStatus() {
            if (navigator.onLine) {
                connectionStatusIcon.classList.remove('connection-offline');
                connectionStatusIcon.classList.add('connection-online');
                connectionStatusIcon.title = 'اتصال به شبکه برقرار است';
                // اگر قبلاً پیام خطای اتصال نمایش داده شده بود، آن را پاک کن
                if (detectionMessageDiv.classList.contains('connection-error-active')) {
                    detectionMessageDiv.classList.remove('connection-error-active');
                    if (detectionMessageText.textContent === "اخطار: اتصال به شبکه قطع است.") {
                         detectionMessageDiv.classList.remove('show'); // فقط پیام را پاک کن
                    }
                }
            } else {
                connectionStatusIcon.classList.remove('connection-online');
                connectionStatusIcon.classList.add('connection-offline');
                connectionStatusIcon.title = 'اخطار: اتصال به شبکه قطع است';
                // پیام قطع اتصال فقط یکبار نمایش داده شود و اگر از قبل فعال باشد، مجدد نمایش داده نشود
                if (!detectionMessageDiv.classList.contains('connection-error-active')) {
                    showMessage("اخطار: اتصال به شبکه قطع است.", 'error', 0); // 0 به معنی ماندگار بودن پیام
                    detectionMessageDiv.classList.add('connection-error-active');
                }
            }
        }
        
        // 4. نمایش پیام‌های تشخیص چهره (موفقیت/عدم موفقیت/خطا)
        function showMessage(msg, type = 'info', duration = 5000) {
            clearTimeout(messageTimeout);
            // اگر پیام خطای اتصال فعال است، پیام‌های دیگر را نمایش نده مگر اینکه خودش خطای اتصال باشد
            if (detectionMessageDiv.classList.contains('connection-error-active') && msg !== "اخطار: اتصال به شبکه قطع است.") {
                return; 
            }
            
            detectionMessageText.textContent = msg;
            detectionMessageDiv.classList.remove('success', 'error', 'info'); // ریست کلاس‌های قبلی
            detectionMessageDiv.classList.add(type, 'show');

            if (duration > 0) {
                messageTimeout = setTimeout(() => {
                    detectionMessageDiv.classList.remove('show');
                }, duration);
            }
        }

        // 5. نشان دادن گزینه‌های قابل انتخاب کاربر متناسب با نقش فرد
        function showUserRoleOptions(role) {
            const allOptionItems = userRoleOptionsContainer.querySelectorAll('.option-item');
            allOptionItems.forEach(item => {
                const requiredRoles = item.dataset.role ? item.dataset.role.split(' ') : [];
                if (requiredRoles.length === 0 || requiredRoles.includes(role)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        }

        // 6. خوش آمدگویی، نمایش ورود/خروج و امکان اصلاح (تا چند ثانیه)
        function handleSimulatedEntryExit(userStatus, userName = '', showCorrection = false) {
            if (!welcomeMessageText) return;

            let welcomeMsgContent = "";
            
            // ابتدا دکمه‌های اصلاح را مخفی کن
            if (correctionOptionsDiv) {
                correctionOptionsDiv.classList.add('hidden');
            }

            if (userStatus === 'entry') {
                welcomeMsgContent = `خوش آمدید، ${userName}!`;
                showMessage(`چهره شناسایی شد. ورود موفقیت آمیز برای ${userName}.`, 'success', 5000);
            } else if (userStatus === 'exit') {
                welcomeMsgContent = `خداحافظ، ${userName}!`;
                showMessage(`چهره شناسایی شد. خروج موفقیت آمیز برای ${userName}.`, 'info', 5000);
            } else if (userStatus === 'correction_needed') {
                welcomeMsgContent = `ورود/خروج ${userName} نیازمند اصلاح است.`;
                showCorrection = true; // نمایش دکمه‌های اصلاح
                showMessage(`خطا: ورود/خروج ${userName} نیازمند اصلاح است.`, 'error', 8000); // پیام اصلی
            } else if (userStatus === 'detected_user') {
                welcomeMsgContent = `کاربر شناسایی شد: ${userName}`;
                showMessage(`کاربر شناسایی شد: ${userName}`, 'info', 3000); // پیام اصلی
            } else if (userStatus === 'not_defined') { // خطا: عدم تعریف فرد در سیستم
                welcomeMsgContent = ""; // پیام خوش‌آمدگویی خاصی ندارد
                showMessage("خطا: چهره شناسایی نشد. فرد در سیستم تعریف نشده است.", 'error', 0); // پیام اصلی و ماندگار
            }

            welcomeMessageText.textContent = welcomeMsgContent;
            
            if (correctionOptionsDiv && showCorrection) {
                correctionOptionsDiv.classList.remove('hidden');
            }
        }
        
        // Listener برای دکمه‌های اصلاح (ورود/خروج)
        if (correctionOptionsDiv) {
            correctionOptionsDiv.addEventListener('click', (event) => {
                if (event.target.classList.contains('correction-button')) {
                    const action = event.target.dataset.action;
                    if (action === 'entry') {
                        showMessage("ورود با موفقیت اصلاح شد.", 'success', 3000);
                    } else if (action === 'exit') {
                        showMessage("خروج با موفقیت اصلاح شد.", 'success', 3000);
                    }
                    correctionOptionsDiv.classList.add('hidden'); // مخفی کردن دکمه‌ها
                    welcomeMessageText.textContent = ""; // پاک کردن پیام خوش‌آمدگویی
                }
            });
        }

        // فراخوانی‌های اولیه و شبیه‌سازی سناریوها در صفحه تشخیص چهره
        startCamera();
        setInterval(updateCameraDateTime, 1000);
        setInterval(updateConnectionStatus, 5000);
        updateCameraDateTime();
        updateConnectionStatus();
        showUserRoleOptions(currentUserRole);

        // شبیه‌سازی سناریوهای تشخیص چهره
        setTimeout(() => {
            handleSimulatedEntryExit('detected_user', 'علی احمدی'); // شبیه‌سازی شناسایی
            currentUserRole = 'admin'; // تغییر نقش
            showUserRoleOptions(currentUserRole); // به‌روزرسانی گزینه‌ها
        }, 3000);

        setTimeout(() => {
            handleSimulatedEntryExit('entry', 'علی احمدی'); // شبیه‌سازی ورود
        }, 6000); // 3 ثانیه بعد از شناسایی

        setTimeout(() => {
            handleSimulatedEntryExit('not_defined', 'ناشناس'); // شبیه‌سازی خطای عدم تعریف فرد
            currentUserRole = 'guest'; // بازگشت به نقش مهمان
            showUserRoleOptions(currentUserRole); // به‌روزرسانی گزینه‌ها
        }, 12000);

        setTimeout(() => {
            handleSimulatedEntryExit('correction_needed', 'فاطمه موسوی', true); // شبیه‌سازی نیاز به اصلاح
        }, 20000);

        setTimeout(() => {
            // فرض می‌کنیم کاربر روی دکمه اصلاح کلیک کرده و اصلاح انجام شده
            handleSimulatedEntryExit('exit', 'فاطمه موسوی'); // شبیه‌سازی خروج
            currentUserRole = 'guest'; // بازگشت به نقش مهمان
            showUserRoleOptions(currentUserRole); // به‌روزرسانی گزینه‌ها
        }, 28000);
    }


    // بررسی اینکه در کدام صفحه هستیم و توابع مربوطه را فراخوانی کن
    const currentPath = window.location.pathname;
    if (currentPath.includes('standby.html')) {
        setupStandByPage();
    } else if (currentPath.includes('face_detection.html')) {
        setupFaceDetectionPage();
    }
});


const roleMap = {
  admin: "ادمین",
  dataTransfer: "مسئول انتقال داده",
  officeManager: "مسئول دفتر",
  unitManager: "مسئول واحد",
  user: "کاربر عادی"
};

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (currentUser) {
  const userRole = roleMap[currentUser.role]; 
  const sections = document.querySelectorAll("[data-role-access]");
  
  sections.forEach(section => {
    const allowed = section.dataset.roleAccess.split(",");
    if (!allowed.includes(userRole)) {
      section.style.display = "none"; 
    }
  });
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}


