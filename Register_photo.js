document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("photoForm");
  const preview = document.getElementById("preview");
  const message = document.getElementById("photoMessage");

  const photoInputs = [
    document.getElementById("photo1"),
    document.getElementById("photo2"),
    document.getElementById("photo3"),
  ];

 
  photoInputs.forEach((input, index) => {
    input.addEventListener("change", () => {
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.style.width = "100px";
          img.style.margin = "5px";
          img.alt = `تصویر ${index + 1}`;

          const old = document.getElementById("preview-img-" + index);
          if (old) old.remove();

          img.id = "preview-img-" + index;
          preview.appendChild(img);
        };
        reader.readAsDataURL(input.files[0]);
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const selectedPhotos = photoInputs.filter(input => input.files.length > 0);
    if (selectedPhotos.length === 0) {
      message.innerText = "حداقل یک تصویر باید انتخاب شود.";
      message.className = "alert alert-danger";
      return;
    }

    const role = document.getElementById("role").value;
    if (!role) {
      message.innerText = "لطفاً نقش کاربر را انتخاب کنید.";
      message.className = "alert alert-danger";
      return;
    }

    const baseUser = JSON.parse(localStorage.getItem("newUser"));
    if (!baseUser) {
      message.innerText = "خطا در دریافت اطلاعات کاربر. لطفاً از ابتدا شروع کنید.";
      message.className = "alert alert-danger";
      return;
    }

   
    const photosData = [];
    let loaded = 0;

    selectedPhotos.forEach((input, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        photosData[index] = e.target.result;
        loaded++;

        if (loaded === selectedPhotos.length) {
          const finalUser = {
            ...baseUser,
            role,
            photos: photosData,
            createdAt: new Date().toLocaleString(),
            createdBy: "سیستم"
          };

          const users = JSON.parse(localStorage.getItem("users")) || [];
          users.push(finalUser);
          localStorage.setItem("users", JSON.stringify(users));
          localStorage.setItem("currentUser", JSON.stringify(finalUser));
          localStorage.removeItem("newUser");
          sessionStorage.setItem("currentUserRole", finalUser.role);



          message.innerText = "کاربر با موفقیت ثبت شد.";
          message.className = "alert alert-success";
        }
      };
      reader.readAsDataURL(input.files[0]);
    });
  });
});