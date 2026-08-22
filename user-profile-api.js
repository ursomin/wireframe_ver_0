"use strict";


// 안내 메시지 표시
function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    setTimeout(function () {

        toast.classList.remove(
            "show"
        );

    }, 2200);
}


// 주소에서 user_id 가져오기
function getUserIdFromUrl() {

    const params =
        new URLSearchParams(
            location.search
        );

    return params.get(
        "user_id"
    );
}


// 상대방 프로필 조회
async function loadUserProfile() {

    const userId =
        getUserIdFromUrl();


    if (!userId) {

        showToast(
            "사용자 번호가 없습니다."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `/api/users/${userId}`
            );


        const data =
            await response.json();


        // 로그인하지 않은 경우
        if (response.status === 401) {

            showToast(
                "로그인이 필요합니다."
            );


            setTimeout(function () {

                location.href =
                    "login.html";

            }, 700);

            return;
        }


        // 사용자가 존재하지 않는 경우
        if (response.status === 404) {

            showToast(
                "존재하지 않는 사용자입니다."
            );

            return;
        }


        if (!response.ok) {

            showToast(
                data.message ||
                "프로필을 불러오지 못했습니다."
            );

            return;
        }


        showUserProfile(
            data
        );

        showSports(
            data.sports
        );

    }

    catch (error) {

        console.error(
            error
        );

        showToast(
            "서버와 연결할 수 없습니다."
        );
    }
}


// 사용자 기본 정보 화면 표시
function showUserProfile(data) {

    document
        .getElementById(
            "userNickname"
        )
        .textContent =
            data.nickname;


    document
        .getElementById(
            "userNicknameInfo"
        )
        .textContent =
            data.nickname;


    document
        .getElementById(
            "userRegion"
        )
        .textContent =
            data.region;


    document
        .getElementById(
            "userRegionInfo"
        )
        .textContent =
            data.region;


    showUserProfileImage(
        data
    );
}


// 상대방 프로필 이미지 표시
function showUserProfileImage(data) {

    const avatar =
        document.getElementById(
            "userAvatar"
        );


    const image =
        document.getElementById(
            "userProfileImage"
        );


    // 등록한 프로필 이미지가 있는 경우
    if (data.profile_image) {

        image.src =
            data.profile_image;

        image.style.display =
            "block";


        avatar.style.display =
            "none";

    }

    // 프로필 이미지가 없는 경우
    else {

        const initial =
            data.nickname
                ? data.nickname.charAt(0)
                : "?";


        avatar.textContent =
            initial;

        avatar.style.display =
            "";


        image.style.display =
            "none";
    }
}


// 운동 프로필 표시
function showSports(sports) {

    const sportsList =
        document.getElementById(
            "sportsList"
        );


    // 아직 운동 프로필이 없는 경우
    if (
        !sports ||
        sports.length === 0
    ) {

        sportsList.textContent =
            "아직 등록된 운동 정보가 없습니다.";

        return;
    }


    // 기존 내용 삭제
    sportsList.innerHTML =
        "";


    sports.forEach(
        function (sport) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "panel";


            item.style.marginBottom =
                "10px";


            item.innerHTML = `
                <strong>
                    ${sport.sport_name}
                </strong>

                <div
                    class="subtle"
                    style="margin-top:6px"
                >
                    실력:
                    ${sport.skill_level}
                </div>
            `;


            sportsList.appendChild(
                item
            );
        }
    );
}


// 페이지가 열리면 상대방 프로필 조회
loadUserProfile();