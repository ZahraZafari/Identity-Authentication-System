document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const welcome = document.getElementById("welcome");
  const profileList = document.getElementById("profile-info");
  const photoContainer = document.getElementById("photo-container");

  if (!user) {
    welcome.innerText = "شما وارد نشده‌اید.";
    return;
  }

  
  welcome.innerText = `سلام ${user.name} ${user.lastName} عزیز!`;

  
 if (user.photos) {
  const photos = Array.isArray(user.photos) ? user.photos : [user.photos];
  
  photos.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `تصویر ${index + 1}`;
    img.className = "profile-photo";
    photoContainer.appendChild(img);
  });
}

 
  const fields = [
    { label: "کد شناسه", value: user.id },
    { label: "نام", value: user.name },
    { label: "نام خانوادگی", value: user.lastName },
    { label: "کد ملی", value: user.nationalCode },
    { label: "نقش", value: getRoleName(user.role) },
    { label: "زمان ثبت", value: user.createdAt || "ثبت نشده" }
  ];

  profileList.innerHTML = fields.map(item => `
    <li><strong>${item.label}:</strong> ${item.value}</li>
  `).join("");
});


function getRoleName(role) {
  const map = {
    admin: "ادمین",
    dataTransfer: "مسئول انتقال داده",
    officeManager: "مسئول دفتر",
    unitManager: "مسئول واحد",
    user: "کاربر عادی"
  };
  return map[role] || "نامشخص";
}