document.addEventListener('DOMContentLoaded', function () {
    var nameInput = document.getElementById("contact-name");
    var emailInput = document.getElementById("text1");
    var mobileInput = document.getElementById("contact-number");
    var passwordInput = document.getElementById("password");
    var confirmPasswordInput = document.getElementById("confirmPassword");
    var submitButton = document.querySelector('input[type="submit"]');
    var nameError = document.getElementById("name");
    var emailError = document.getElementById("email");
    var mobileError = document.getElementById("mobile");
    var submitError = document.getElementById("submit-error");
    var successMessage = document.getElementById("success-message");

    nameInput.addEventListener('keyup', validateName);
    emailInput.addEventListener('keyup', validateEmail);
    mobileInput.addEventListener('keyup', validateMobile);
    passwordInput.addEventListener('keyup', validatePassword);
    confirmPasswordInput.addEventListener('keyup', validatePassword);
    submitButton.addEventListener('click', function (event) {
        if (!validateForm()) {
            event.preventDefault(); // Prevent form submission if validation fails
        }
    });

    function validateName() {
        var name1 = document.getElementById("contact-name").value;
        if (name1.length === 0) {
            nameError.innerHTML = "Name is required";
            return false;
        }
        if (!name1.match(/^[A-Za-z]+\s[A-Za-z]+$/)) {
            nameError.innerHTML = "Full name required";
            return false;
        } else {
            nameError.innerHTML = "";
            return true;
        }
    }

    function validateEmail() {
        var email1 = document.getElementById("text1").value;
        if (email1.length === 0) {
            emailError.innerHTML = "Email is required";
            return false;
        }
        if (!email1.match(/^([\w-]+\.)*?[\w-]+@[\w-]+\.([\w-]+\.)*?[\w]+$/)) {
            emailError.innerHTML = "Email is invalid";
            return false;
        }
        emailError.innerHTML = "";
        return true;
    }

    function validateMobile() {
        var mob = document.getElementById("contact-number").value;
        if (mob.length === 0) {
            mobileError.innerHTML = "Mobile number is required";
            return false;
        }
        if (!mob.match(/^[0-9]{10}$/)) {
            mobileError.innerHTML = "Enter a valid 10-digit mobile number";
            return false;
        } else {
            mobileError.innerHTML = "";
            return true;
        }
    }


    function validatePassword() {
        var password = document.getElementById("password").value;
        var confirmPassword = document.getElementById("confirmPassword").value;
        var submitError = document.getElementById("submit-error"); // Corrected ID

        if (password.length === 0 || confirmPassword.length === 0) {
            submitError.innerHTML = "";
            return true;
        }

        if (password.length < 8) {
            submitError.style.display = "block";
            submitError.innerHTML = "Password must be at least 8 characters long";
            return false;
        }

        const uppercaseRegex = /[A-Z]/;
        const lowercaseRegex = /[a-z]/;
        const digitRegex = /\d/;
        const specialCharRegex = /[!@#$%^&*()\-_=+{}[\]|\\;:'",.<>/?]/;

        if (!uppercaseRegex.test(password) || !lowercaseRegex.test(password) || !digitRegex.test(password) || !specialCharRegex.test(password)) {
            submitError.style.display = "block";
            submitError.innerHTML = "Password must include at least one uppercase letter, lowercase letter, digit, and special character";
            return false;
        }

        if (password !== confirmPassword) {
            submitError.style.display = "block";
            submitError.innerHTML = "Passwords do not match";
            return false;
        } else {
            submitError.style.display = "none";
            return true;
        }
    }


   function validateForm() {
    if (!validateName() || !validateEmail() || !validateMobile() || !validatePassword()) {
      submitError.style.display = "block";
      submitError.innerHTML = "Please fill in all fields";
      setTimeout(function () {
        submitError.style.display = "none";
      }, 3000);
      return false; // Prevent form submission
    }

        setTimeout(function () {
            if (successMessage) {
                successMessage.style.display = "none";
            }
        }, 3000);
       
       return true
    }
    
})