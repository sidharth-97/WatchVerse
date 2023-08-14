document.addEventListener("DOMContentLoaded", function () {
    console.log("reached");

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

        // Add event listeners for input fields
        nameInput.addEventListener('keyup', validateName);
        emailInput.addEventListener('keyup', validateEmail);
        mobileInput.addEventListener('keyup', validateMobile);
        passwordInput.addEventListener('keyup', validatePassword);
        confirmPasswordInput.addEventListener('keyup', validatePassword);

        // Add event listener for the form submission
        submitButton.addEventListener('click', function (event) {
            if (!validateForm()) {
                event.preventDefault(); // Prevent form submission if validation fails
            }
        });

    function validateEmail() {
        var email1 = emailInput.value;
      console.log(email1);
        if (email1.length == 0) {
            emailError.innerHTML = "Email is required";
            return false;
        }
        if (!email1.match(/^([a-zA-Z0-9\._]+)@([a-zA-z0-9])+\.([a-z]+)(\.[a-z]+)?$/)) {
            emailError.innerHTML = "Email is invalid";
            return false;
        }
        emailError.innerHTML = "";
        return true;
    }

    var submitButton = document.getElementById("submit-button");
    submitButton.addEventListener("click", function (event) {
        if (!validateForm()) {
            event.preventDefault(); 
        }
    });

    function validateForm() {
        if (!validateEmail()) {
            submitError.style.display = 'block';
            submitError.innerHTML = "Please enter a valid email";
            setTimeout(function () { submitError.style.display = 'none'; }, 3000);
            return false;
        }
    }

})

