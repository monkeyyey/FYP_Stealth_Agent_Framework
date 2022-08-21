function loginborderyellow(input) {
    input.className = 'm-3 p-4 border border-warning col-sm-10 col-md-10 col-lg-10 justify-content-center text-warning'
}
function loginbordernormal(input) {
    input.className = 'm-3 p-4 border border-secondary col-sm-10 col-md-10 col-lg-10 justify-content-center'
}
function infoborderyellow(input) {
    input.className = 'mb-4 p-4 border border-warning col-sm-10 col-md-10 col-lg-10'
}
function infobordernormal(input) {
    input.className = 'mb-4 p-4 border border-secondary col-sm-10 col-md-10 col-lg-10'
}
$('#login-btn').click(function(e) {
    e.preventDefault();

        const username = $("#username").val();
        const password = $("#password").val();

        const requestBody = {
            username: username,
            password: password
        };

        axios.post(`/api/auth/authLogin`, requestBody)
            .then((response) => {
                console.log(response)
                var id = response.data.id
                $('#google-code').append(`
                <div class="border border-secondary" id="google-code-form">
                    <p>Enter the code on your app in the text field and click Submit.</p>
                    <div class="col-xs-4">
                        <label for="user-code" class="form-label">Google Authenticator Code</label>
                        <input type="text" class="form-control" id="user-code" name="user-code">
                    </div>
                    <button type="submit" class="btn btn-warning" onclick = "googleVerify(${id})">Submit</button>
                </div>
                
            `)

        })
        .catch((error) => {
            console.log(error);
            if (error.response.status === 401) {
                alert("Wrong login info");
            } else {
                alert("Something unexpected went wrong.");
            }
        });
    
});



// verifies the OTP sent and redirects to home page if otp is correct
function googleVerify(id){
    const code = $("#user-code").val();
    const requestBody = {
        code: code,
        id: id
    };
    axios.post(`/api/auth/sign-in-otp`, requestBody)
        .then((response) => {
            const admin = response.data.user.admin
            console.log(admin+ "sos")
            if (admin == 1){
                localStorage.setItem('jwt_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.location.href = "/home"
            }
            else{
                alert("You are not admin!");
            }

        })
        .catch((error) => {
            console.log(error);
            if (error.response.status === 401) {
                alert("Wrong login info");
            } else {
                alert("Something unexpected went wrong.");
            }
    });
}



// ----------------------------------------------------- //
// ------------------ FORGET PASSWORD ------------------ //
// ----------------------------------------------------- //

// append email form to send OTP pass when 'forget password' button is pressed
function forgetPass(){
    event.preventDefault();
    $('#otp-code').append(`
        <div class="col-xs-4 border border-secondary" id="forget-pass-otp-form">
            <div class="form-group">
                <label for="email" class="form-label">Enter email address used to sign up: </label>
                <input type="text" class="form-control" id="email" name="email">
            </div>
            
            <button type="submit" class="btn btn-warning">Send verification code</button>
        </div>
    `)
};

// sends entered email to back end
// forgetPass endpoint will check database to see if acount exist
// if account exists, OTP will be sent to email and the OTP form will appear
$("#otp-code").submit((event) => {
    // prevent page reload
    event.preventDefault();
    const email = $("#email").val();
    const requestBody = {
        email: email,
    };
    axios.post(`/api/auth/forgetPass`, requestBody)
        .then((response) => {
            console.log(response)
            console.log(response.data.id)
            var id = response.data.id
            $('#code-form').append(`
                <div class="form-group border border-secondary" id="enter-otp-form">
                    <label for="code" class="form-label">Enter OTP code sent to your email: </label>
                    <input type="text" class="form-control" id="code" name="code">
                    <button type="submit" class="btn btn-warning" onclick="verifyPassOTP(${id})">Submit</button>
                </div>
                
            `)
            

        })
        .catch((error) => {
            console.log(error);
            if (error.response.status === 401) {
                alert("Wrong login info");
            } else {
                alert("Something unexpected went wrong.");
            }
        });
    
});

// sends user entered code to backend to verify 
// if code is correct, new password form will appear for user to enter their new password
function verifyPassOTP(id){
    event.preventDefault();
    const code = $("#code").val()
    const requestBody = {
        code: code,
        id, id
    };
    axios.post(`/api/auth/email-otp`, requestBody)
        .then((response) => {
            if(response.status == 200){
                var id = response.data.id
                $("#pass-form").append(`
                <div class="form-group border border-secondary" id="new-pass-form">
                    <label for="newPass" class="form-label">Enter your new password: </label>
                    <input type="password" class="form-control" id="newPass" name="newPass">
                    <button type="submit" class="btn btn-warning" onclick="updatePass(${id})">Submit</button>
                </div>
               
                `)
            }
        })
        .catch((error) => {
            console.log(error);
            if (error.response.status === 401) {
                alert("Wrong login info");
            } else {
                alert("Something unexpected went wrong.");
            }
    });
}

// sends new password to backend 
function updatePass(id){
    const pass = $("#newPass").val()
    const requestBody = {
        id, id,
        password: pass
    };
    axios.put(`/api/auth/newPass`, requestBody)
        .then((response) => {
            console.log(response)
            alert("Please login with new password")
            window.location.href = "/login"
            
        })
        .catch((error) => {
            console.log(error);
            if (error.response.status === 401) {
                alert("Wrong login info");
            } else {
                alert("Something unexpected went wrong.");
            }
    });

}
