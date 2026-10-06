const existingUsers = [
  { id: "123", name: "Ali", lastName: "Rezaei", nationalCode: "1111111111" },
  { id: "456", name: "Sara", lastName: "Ahmadi", nationalCode: "2222222222" },
  { id: "749", name: "Fatemeh", lastName: "Mirzaei", nationalCode: "3333333333" }
];


const usersFromStorage = JSON.parse(localStorage.getItem("users")) || [];


const allUsers = existingUsers.concat(usersFromStorage);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("identityForm");
  const message = document.getElementById("message");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    
    const id = document.getElementById("userId").value.trim();
    const name = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const nationalCode = document.getElementById("nationalCode").value.trim();

    
    const idExists = allUsers.find((user) => user.id === id);
    const ncExists = allUsers.find((user) => user.nationalCode === nationalCode);

    if (idExists && ncExists) {
      message.innerHTML = "این کاربر از قبل ثبت شده است.<br><button onclick='editUser()'>ویرایش اطلاعات</button>";
      message.style.color = "orange";
    } else if (idExists) {
      message.innerText = "شناسه وارد شده تکراری است. امکان ثبت وجود ندارد.";
      message.style.color = "red";
    } else if (ncExists) {
      message.innerText = "کد ملی وارد شده قبلاً استفاده شده. امکان ثبت وجود ندارد.";
      message.style.color = "red";
    } else {
     
      const newUser = {
        id,
        name,
        lastName,
        nationalCode,
        createdAt: new Date().toLocaleString() 
      };

      localStorage.setItem("newUser", JSON.stringify(newUser));
      window.location.href = "./Register_Photo.html";
    }
  });
});


function editUser() {
  alert("در این مرحله باید بخش ویرایش اطلاعات باز شود. (می‌تونیم این رو بعداً بسازیم)");
}