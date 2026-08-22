"use strict";


let currentUser = null;


// 안내 메시지
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


// 내 프로필 조회
async function loadMyProfile() {

    try {

        const response =
            await fetch(
                "/api/users/me"
            );


        const data =
            await response.json();


        if (response.status === 401) {

            location.href =
                "login.html";

            return;
        }


        if (!response.ok) {

            showToast(
                data.message ||
                "프로필 조회 실패"
            );

            return;
        }


        currentUser = data;


        showProfile(
            data
        );


        fillEditForm(
            data
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


// 프로필 화면 표시
function showProfile(data) {

    document
        .getElementById(
            "profileNickname"
        )
        .textContent =
            data.nickname;


    document
        .getElementById(
            "profileNicknameInfo"
        )
        .textContent =
            data.nickname;


    document
        .getElementById(
            "profileRegion"
        )
        .textContent =
            data.region;


    document
        .getElementById(
            "profileRegionInfo"
        )
        .textContent =
            data.region;


    document
        .getElementById(
            "profileLoginId"
        )
        .textContent =
            data.login_id;


    document
        .getElementById(
            "profileEmail"
        )
        .textContent =
            data.email;


    document
        .getElementById(
            "profileBirthDate"
        )
        .textContent =
            data.birth_date;


    document
        .getElementById(
            "profileGender"
        )
        .textContent =
            data.gender === "MALE"
                ? "남성"
                : "여성";


    showProfileImage(
        data
    );
}


// 프로필 사진 표시
function showProfileImage(data) {

    const avatar =
        document.getElementById(
            "profileAvatar"
        );


    const image =
        document.getElementById(
            "profileImage"
        );


    const headerAvatar =
        document.getElementById(
            "headerAvatar"
        );


    const headerImage =
        document.getElementById(
            "headerProfileImage"
        );


    if (data.profile_image) {

        image.src =
            data.profile_image;

        image.style.display =
            "block";

        avatar.style.display =
            "none";


        headerImage.src =
            data.profile_image;

        headerImage.style.display =
            "block";

        headerAvatar.style.display =
            "none";

    }

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


        headerAvatar.textContent =
            initial;

        headerAvatar.style.display =
            "";


        headerImage.style.display =
            "none";
    }
}


// 수정폼에 현재 값 입력
function fillEditForm(data) {

    document
        .getElementById(
            "editLoginId"
        )
        .value =
            data.login_id;


    document
        .getElementById(
            "editNickname"
        )
        .value =
            data.nickname;


    document
        .getElementById(
            "editEmail"
        )
        .value =
            data.email;


    document
        .getElementById(
            "editBirthDate"
        )
        .value =
            data.birth_date;


    document
        .getElementById(
            "editGender"
        )
        .value =
            data.gender;


    document
        .getElementById(
            "editRegion"
        )
        .value =
            data.region;
}


// 프로필 수정 열기
function openEditMode() {

    if (currentUser) {

        fillEditForm(
            currentUser
        );
    }


    document
        .getElementById(
            "profileView"
        )
        .style.display =
            "none";


    document
        .getElementById(
            "profileEdit"
        )
        .style.display =
            "block";
}


// 프로필 수정 취소
function closeEditMode() {

    document
        .getElementById(
            "profileEdit"
        )
        .style.display =
            "none";


    document
        .getElementById(
            "profileView"
        )
        .style.display =
            "block";
}


// 프로필 수정 저장
async function saveProfile() {

    const body = {

        nickname:
            document
                .getElementById(
                    "editNickname"
                )
                .value
                .trim(),

        email:
            document
                .getElementById(
                    "editEmail"
                )
                .value
                .trim(),

        birth_date:
            document
                .getElementById(
                    "editBirthDate"
                )
                .value,

        gender:
            document
                .getElementById(
                    "editGender"
                )
                .value,

        region:
            document
                .getElementById(
                    "editRegion"
                )
                .value
                .trim()
    };


    if (
        !body.nickname ||
        !body.email ||
        !body.birth_date ||
        !body.gender ||
        !body.region
    ) {

        showToast(
            "모든 정보를 입력해주세요."
        );

        return;
    }


    try {

        const response =
            await fetch(
                "/api/users/me",
                {
                    method:
                        "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            body
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "프로필 수정 실패"
            );

            return;
        }


        showToast(
            "프로필이 수정되었습니다."
        );


        await loadMyProfile();

        closeEditMode();

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


// 전체 운동 종목 조회
async function loadSportsList() {

    try {

        const response =
            await fetch(
                "/api/sports"
            );


        const data =
            await response.json();


        if (!response.ok) {
            return;
        }


        const select =
            document.getElementById(
                "sportSelect"
            );


        select.innerHTML =
            '<option value="">종목 선택</option>';


        data.sports.forEach(
            function (sport) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    sport.sport_id;


                option.textContent =
                    sport.sport_name;


                select.appendChild(
                    option
                );
            }
        );

    }

    catch (error) {

        console.error(
            error
        );
    }
}


// 내 운동 프로필 조회
async function loadMySports() {

    try {

        const response =
            await fetch(
                "/api/users/me/sports"
            );


        const data =
            await response.json();


        if (!response.ok) {
            return;
        }


        showMySports(
            data.sports
        );

    }

    catch (error) {

        console.error(
            error
        );
    }
}


// 운동 프로필 화면 표시
function showMySports(sports) {

    const list =
        document.getElementById(
            "mySportsList"
        );


    if (
        !sports ||
        sports.length === 0
    ) {

        list.textContent =
            "등록한 운동 종목이 없습니다.";

        return;
    }


    list.innerHTML =
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
                <div
                    style="
                        display:flex;
                        gap:10px;
                        align-items:center;
                        justify-content:space-between;
                        flex-wrap:wrap;
                    "
                >

                    <strong>
                        ${sport.sport_name}
                    </strong>

                    <div
                        style="
                            display:flex;
                            gap:8px;
                        "
                    >

                        <select
                            id="skill-${sport.sport_id}"
                        >

                            <option
                                value="BRONZE"
                                ${sport.skill_level === "BRONZE" ? "selected" : ""}
                            >
                                BRONZE
                            </option>

                            <option
                                value="SILVER"
                                ${sport.skill_level === "SILVER" ? "selected" : ""}
                            >
                                SILVER
                            </option>

                            <option
                                value="GOLD"
                                ${sport.skill_level === "GOLD" ? "selected" : ""}
                            >
                                GOLD
                            </option>

                            <option
                                value="MASTER"
                                ${sport.skill_level === "MASTER" ? "selected" : ""}
                            >
                                MASTER
                            </option>

                        </select>

                        <button
                            class="btn"
                            type="button"
                            onclick="updateSport(${sport.sport_id})"
                        >
                            실력 변경
                        </button>

                        <button
                            class="btn"
                            type="button"
                            onclick="deleteSport(${sport.sport_id})"
                        >
                            삭제
                        </button>

                    </div>

                </div>
            `;


            list.appendChild(
                item
            );
        }
    );
}


// 운동 종목 추가
async function addSport() {

    const sportId =
        document
            .getElementById(
                "sportSelect"
            )
            .value;


    const skillLevel =
        document
            .getElementById(
                "skillSelect"
            )
            .value;


    if (!sportId) {

        showToast(
            "종목을 선택해주세요."
        );

        return;
    }


    const response =
        await fetch(
            "/api/users/me/sports",
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        sport_id:
                            Number(
                                sportId
                            ),

                        skill_level:
                            skillLevel
                    })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        showToast(
            data.message
        );

        return;
    }


    showToast(
        "운동 종목이 추가되었습니다."
    );


    await loadMySports();
}


// 운동 실력 변경
async function updateSport(
    sportId
) {

    const skillLevel =
        document
            .getElementById(
                `skill-${sportId}`
            )
            .value;


    const response =
        await fetch(
            `/api/users/me/sports/${sportId}`,
            {
                method:
                    "PATCH",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        skill_level:
                            skillLevel
                    })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        showToast(
            data.message
        );

        return;
    }


    showToast(
        "실력이 변경되었습니다."
    );


    await loadMySports();
}


// 운동 종목 삭제
async function deleteSport(
    sportId
) {

    if (
        !confirm(
            "이 운동 종목을 삭제하시겠습니까?"
        )
    ) {
        return;
    }


    const response =
        await fetch(
            `/api/users/me/sports/${sportId}`,
            {
                method:
                    "DELETE"
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        showToast(
            data.message
        );

        return;
    }


    showToast(
        "운동 종목이 삭제되었습니다."
    );


    await loadMySports();
}


// 프로필 사진 업로드
async function uploadProfileImage() {

    const input =
        document.getElementById(
            "profileImageInput"
        );


    if (!input.files.length) {

        showToast(
            "사진을 선택해주세요."
        );

        return;
    }


    const formData =
        new FormData();


    formData.append(
        "profile_image",
        input.files[0]
    );


    const response =
        await fetch(
            "/api/users/me/profile-image",
            {
                method:
                    "POST",

                body:
                    formData
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        showToast(
            data.message
        );

        return;
    }


    showToast(
        "프로필 사진이 변경되었습니다."
    );


    input.value =
        "";


    await loadMyProfile();
}


// 비밀번호 변경
async function changePassword() {

    const currentPassword =
        document
            .getElementById(
                "currentPassword"
            )
            .value;


    const newPassword =
        document
            .getElementById(
                "newPassword"
            )
            .value;


    const newPasswordCheck =
        document
            .getElementById(
                "newPasswordCheck"
            )
            .value;


    if (
        !currentPassword ||
        !newPassword ||
        !newPasswordCheck
    ) {

        showToast(
            "비밀번호를 모두 입력해주세요."
        );

        return;
    }


    if (newPassword.length < 8) {

        showToast(
            "새 비밀번호는 8자 이상이어야 합니다."
        );

        return;
    }


    if (
        newPassword !==
        newPasswordCheck
    ) {

        showToast(
            "새 비밀번호가 일치하지 않습니다."
        );

        return;
    }


    if (
        currentPassword ===
        newPassword
    ) {

        showToast(
            "현재 비밀번호와 다른 비밀번호를 입력해주세요."
        );

        return;
    }


    try {

        const response =
            await fetch(
                "/api/users/me/password",
                {
                    method:
                        "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            current_password:
                                currentPassword,

                            new_password:
                                newPassword
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            if (response.status === 401) {

                showToast(
                    "현재 비밀번호가 올바르지 않습니다."
                );

            }

            else {

                showToast(
                    data.message ||
                    "비밀번호 변경에 실패했습니다."
                );
            }


            return;
        }


        document
            .getElementById(
                "currentPassword"
            )
            .value =
                "";


        document
            .getElementById(
                "newPassword"
            )
            .value =
                "";


        document
            .getElementById(
                "newPasswordCheck"
            )
            .value =
                "";


        showToast(
            "비밀번호가 변경되었습니다."
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


// 로그아웃
async function logout() {

    await fetch(
        "/api/auth/logout",
        {
            method:
                "POST"
        }
    );


    location.href =
        "login.html";
}


// 계정 삭제
async function deleteAccount() {

    if (
        !confirm(
            "정말 계정을 삭제하시겠습니까?"
        )
    ) {
        return;
    }


    const response =
        await fetch(
            "/api/users/me",
            {
                method:
                    "DELETE"
            }
        );


    if (response.ok) {

        location.href =
            "login.html";
    }
}


// 버튼 연결
document
    .getElementById(
        "editButton"
    )
    .addEventListener(
        "click",
        openEditMode
    );


document
    .getElementById(
        "cancelButton"
    )
    .addEventListener(
        "click",
        closeEditMode
    );


document
    .getElementById(
        "saveButton"
    )
    .addEventListener(
        "click",
        saveProfile
    );


document
    .getElementById(
        "uploadImageButton"
    )
    .addEventListener(
        "click",
        uploadProfileImage
    );


document
    .getElementById(
        "addSportButton"
    )
    .addEventListener(
        "click",
        addSport
    );


document
    .getElementById(
        "changePasswordButton"
    )
    .addEventListener(
        "click",
        changePassword
    );


document
    .getElementById(
        "logoutButton"
    )
    .addEventListener(
        "click",
        logout
    );


document
    .getElementById(
        "deleteAccountButton"
    )
    .addEventListener(
        "click",
        deleteAccount
    );


loadMyProfile();

loadSportsList();

loadMySports();