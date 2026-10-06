document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginMessage");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const userId = document.getElementById("userId").value.trim();
    const nationalCode = document.getElementById("nationalCode").value.trim();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (u) => u.id === userId && u.nationalCode === nationalCode
    );

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      const roleMap = {
  admin: "ادمین",
  unitManager: "مسئول واحد",
  dataTransfer: "مسئول انتقال داده",
  officeManager: "مسئول دفتر",
  user: "کاربر عادی"
};

const persianRole = roleMap[user.role] || "نامشخص";
sessionStorage.setItem("currentUserRole", persianRole);

      sessionStorage.setItem("currentUserRole", user.role);

      message.className = "alert alert-success";
      message.innerText = `خوش آمدید ${user.name} ${user.lastName}!`;

      setTimeout(() => {
        window.location.href = "index.html"; 
      }, 1500);
    } else {
      
      message.className = "alert alert-danger";
      message.innerText = "کد شناسه یا کد ملی اشتباه است.";
    }
  });
});