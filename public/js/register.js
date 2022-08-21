var count = 0
axios.post(`/api/auth/adminaccess`, {token: localStorage.getItem('jwt_token')}).then((response) => {
    if (response.data.access == 0){
        window.location.href = '/'
    }
})
function logout(){
    localStorage.clear()
}
function regborderyellow(input) {
    input.className = 'm-3 p-4 border border-warning text-warning col-sm-10 col-md-5 col-lg-4'
}
function regbordernormal(input) {
    input.className = 'm-3 p-4 border border-secondary col-sm-10 col-md-5 col-lg-4'
}
function authborderyellow(input) {
    input.className = 'm-3 p-4 border border-warning text-warning col-sm-10 col-md-5 col-lg-3'
}
function authbordernormal(input) {
    input.className = 'm-3 p-4 border border-secondary col-sm-10 col-md-5 col-lg-3'
}
function submitborderyellow(input) {
    input.className = 'col-12 border m-1 border-warning bg-secondary text-center'
}
function submitbordernormal(input) {
    input.className = 'col-12 border border-secondary text-center'
}

function register() {
    // event.preventDefault();
    count += 1
    var gotError = 0
    const username = document.getElementById('username')
    const usernameValue = $("#username").val().trim()
    const admin_username = document.getElementById('admin_username')
    const admin_usernameValue = $("#admin_username").val().trim()
    const password = document.getElementById('password')
    const passwordValue = $("#password").val().trim()
    const retype_password = document.getElementById('retype_password')
    const retype_passwordValue = $("#retype_password").val().trim()
    const admin_password = document.getElementById('admin_password')
    const admin_passwordValue = $("#admin_password").val().trim()
    const number = document.getElementById('Phone_Number')
    const numberValue = $("#Phone_Number").val().trim()
    const email =document.getElementById('Email')
    const emailValue = $("#Email").val().trim()
    function setErrorForUsername(input, message) {
        gotError = 1 
        var formControl = input.parentElement
        var small = formControl.querySelector('small')
        small.innerText = message
        formControl.className = 'form-group-error mt-4 mb-2 col-12'
    }
    function setErrorForPasswordandEmail(input, message) {
        gotError = 1 
        var formControl = input.parentElement
        var small = formControl.querySelector('small')
        small.innerText = message
        formControl.className = 'form-group-error my-2 col-12'
    }
    function setErrorForNumber(input, message) {
        gotError = 1 
        var formControl = input.parentElement
        var small = formControl.querySelector('small')
        small.innerText = message
        formControl.className = 'form-group-error my-2 col-12'
    }
    function isEmail(email){
        return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email)
    }
    function isNumeric(value) {
        return /^-?\d+$/.test(value);
    }
    function setSuccessForUsername(input) {
        var formControl = input.parentElement
        var small = formControl.querySelector('small')
        small.innerText = ''
        formControl.className = 'form-group mt-4 mb-2 col-12'
    }
    function setSuccessForPasswordandEmail(input) {
        var formControl = input.parentElement
        var small = formControl.querySelector('small')
        small.innerText = ''
        formControl.className = 'form-group my-2 col-12'
    }
    function setSuccessForNumber(input) {
        var formControl = input.parentElement
        var small = formControl.querySelector('small')
        small.innerText = ''
        formControl.className = 'form-group my-2 col-12'
    }
    if(usernameValue ==="") {
        setErrorForUsername(username, 'Username cannot be empty!')
    }
    else{
        setSuccessForUsername(username)
    }
    if(admin_usernameValue ==="") {
        setErrorForUsername(admin_username, 'Username cannot be empty!')
    }
    else{
        setSuccessForUsername(admin_username)
    }

    if(emailValue ===""){
        setErrorForPasswordandEmail(email, 'Email cannot be blank!')
    }
    else if (!isEmail(emailValue)){
        setErrorForPasswordandEmail(email, 'Invalid Email!')
    }
    else{
        setSuccessForPasswordandEmail(email)
    }

    if(passwordValue ==="") {
        setErrorForPasswordandEmail(password, 'Password cannot be empty!')
    }
    else if (passwordValue.length < 8){
        setErrorForPasswordandEmail(password, 'Password must be at least 8 characters long!')
    }
    else{
        setSuccessForPasswordandEmail(password)
    }

    if(retype_passwordValue ==="") {
        setErrorForPasswordandEmail(retype_password, 'Password cannot be empty!')
    }
    else if (retype_passwordValue.length < 8){
        setErrorForPasswordandEmail(retype_password, 'Password must be at least 8 characters long!')
    }
    else{
        setSuccessForPasswordandEmail(retype_password)
    }
    if(admin_passwordValue ==="") {
        setErrorForPasswordandEmail(admin_password, 'Password cannot be empty!')
    }
    else if (admin_passwordValue.length < 8){
        setErrorForPasswordandEmail(admin_password, 'Password must be at least 8 characters long!')
    }
    else{
        setSuccessForPasswordandEmail(admin_password)
    }

    if(numberValue ==="") {
        setErrorForNumber(number, 'Phone Number cannot be blank!')
    }
    else if (!isNumeric(numberValue)||numberValue.length < 8){
        setErrorForNumber(number, 'Invalid Phone Number!')
    }
    else{
        setSuccessForNumber(number)
    }
    if (count >= 200){
        alert("Register failed")
    }
    else{
        if(!gotError){
            requestBody = {
                username: usernameValue,
                email:emailValue,
                contact: numberValue,
                password: passwordValue,
                retype_password: retype_passwordValue,
                admin_username: admin_usernameValue,
                admin_password: admin_passwordValue
            }

            axios.post(`/api/users/register`, requestBody).then((response)=> {
                qr = response.data
                $('#qr-code').append(`
                    <h1>Sign Up - Set 2FA</h1>
                    <for>
                     <p>Scan the QR Code in the Authenticator app then enter the code that you see in the app in the text field and click Submit.</p>
                     <img src="${qr}" class="img-fluid" />
                     <div class="mb-3">
                         <label for="code" class="form-label">2FA Code</label>
                         <input type="text" class="form-control" id="code" name="code">
                    </div>
                    <div class="mb-3">
                        <label for="username" class="form-label">username</label>
                        <input type="text" class="form-control" id="username" name="username">
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">password</label>
                        <input type="text" class="form-control" id="password" name="password">
                    </div>
                    <button onclick="mfa_signup()" class="btn btn-primary">Submit</button>
                    </form>
                `)
            
            }).catch((error) => {
                alert(error.response.data.message)
            })
        }
    }
}

function mfa_signup(){
    const code = $("#code").val().trim()
    const username = $("#username").val().trim()
    const password = $("#password").val().trim()

    var request_body = {
        code: code,
        username: username,
        password: password
    }
    axios.post("/api/users/sign-up-2fa", request_body).then((response) => {
        if(response.data.message=="done"){
            window.location.href = "/home"
        }
        else{
            alert(response.data.message)
        }
    })
}