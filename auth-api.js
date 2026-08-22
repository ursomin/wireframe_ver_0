"use strict";


// 화면 아래에 짧은 안내 메시지를 보여주는 함수
function showToast(message) {

    const toast = document.getElementById("toast");

    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(function () {

        toast.classList.remove("show");

    }, 2200);
}


// 로그인 기능
async function login() {

    const loginId =
        document.getElementById("loginId").value.trim();

    const password =
        document.getElementById("loginPassword").value;


    if (!loginId || !password) {

        showToast(
            "아이디와 비밀번호를 입력해주세요."
        );

        return;
    }


    try {

        const response = await fetch(
            "/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    login_id: loginId,
                    password: password
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            showToast(
                data.message || "로그인에 실패했습니다."
            );

            return;
        }


        showToast("로그인 성공");


        setTimeout(function () {

            location.href = "index.html";

        }, 500);


    } catch (error) {

        console.error(error);

        showToast(
            "서버와 연결할 수 없습니다."
        );
    }
}


// 회원가입 기능
async function signup() {

    const loginId =
        document
            .getElementById("signupLoginId")
            .value
            .trim();


    const nickname =
        document
            .getElementById("signupNickname")
            .value
            .trim();


    const password =
        document
            .getElementById("signupPassword")
            .value;


    const passwordCheck =
        document
            .getElementById("signupPasswordCheck")
            .value;


    const birthDate =
        document
            .getElementById("signupBirthDate")
            .value;


    const gender =
        document
            .getElementById("signupGender")
            .value;


    const email =
        document
            .getElementById("signupEmail")
            .value
            .trim();


    const region =
        document
            .getElementById("signupRegion")
            .value
            .trim();


    if (
        !loginId ||
        !nickname ||
        !password ||
        !passwordCheck ||
        !birthDate ||
        !gender ||
        !email ||
        !region
    ) {

        showToast(
            "필수 정보를 모두 입력해주세요."
        );

        return;
    }


    if (password !== passwordCheck) {

        showToast(
            "비밀번호가 일치하지 않습니다."
        );

        return;
    }


    if (password.length < 8) {

        showToast(
            "비밀번호는 8자 이상이어야 합니다."
        );

        return;
    }


    const requiredTerms =
        document.querySelectorAll(
            ".requiredTerms"
        );


    const allTermsChecked =
        Array.from(requiredTerms).every(
            function (checkbox) {

                return checkbox.checked;

            }
        );


    if (!allTermsChecked) {

        showToast(
            "필수 약관에 모두 동의해주세요."
        );

        return;
    }


    try {

        const response = await fetch(
            "/api/auth/signup",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    login_id: loginId,
                    password: password,
                    nickname: nickname,
                    email: email,
                    birth_date: birthDate,
                    gender: gender,
                    region: region
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "회원가입에 실패했습니다."
            );

            return;
        }


        showToast(
            "회원가입에 성공했습니다."
        );


        setTimeout(function () {

            location.href = "login.html";

        }, 700);


    } catch (error) {

        console.error(error);

        showToast(
            "서버와 연결할 수 없습니다."
        );
    }
}


// 로그인 페이지라면 로그인 버튼 연결
const loginButton =
    document.getElementById("loginButton");


if (loginButton) {

    loginButton.addEventListener(
        "click",
        login
    );


    const passwordInput =
        document.getElementById(
            "loginPassword"
        );


    passwordInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                login();

            }
        }
    );
}


// 회원가입 페이지라면 회원가입 버튼 연결
const signupButton =
    document.getElementById("signupButton");


if (signupButton) {

    signupButton.addEventListener(
        "click",
        signup
    );
}