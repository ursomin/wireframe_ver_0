"use strict";


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


// 운동 종목 목록 가져오기
async function loadSports() {

    try {

        const response =
            await fetch(
                "/api/sports"
            );


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                "운동 종목을 불러오지 못했습니다."
            );

            return;
        }


        const select =
            document.getElementById(
                "meetingSport"
            );


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


        showToast(
            "서버와 연결할 수 없습니다."
        );
    }
}


// 모임 생성
async function createMeeting() {

    const title =
        document
            .getElementById(
                "meetingTitle"
            )
            .value
            .trim();


    const sportId =
        document
            .getElementById(
                "meetingSport"
            )
            .value;


    const meetingDate =
        document
            .getElementById(
                "meetingDate"
            )
            .value;


    // location이라고 쓰면
    // 브라우저의 window.location과 이름이 겹침
    const meetingLocation =
        document
            .getElementById(
                "meetingLocation"
            )
            .value
            .trim();


    const maxMembers =
        document
            .getElementById(
                "meetingMaxMembers"
            )
            .value;


    const description =
        document
            .getElementById(
                "meetingDescription"
            )
            .value
            .trim();


    if (
        !title ||
        !sportId ||
        !meetingDate ||
        !meetingLocation ||
        !maxMembers ||
        !description
    ) {

        showToast(
            "모든 정보를 입력해주세요."
        );

        return;
    }


    if (
        Number(maxMembers) < 1
    ) {

        showToast(
            "모집 인원은 1명 이상이어야 합니다."
        );

        return;
    }


    try {

        const response =
            await fetch(
                "/api/meetings",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            title:
                                title,

                            description:
                                description,

                            sport_id:
                                Number(
                                    sportId
                                ),

                            meeting_date:
                                meetingDate,

                            location:
                                meetingLocation,

                            max_members:
                                Number(
                                    maxMembers
                                )
                        })
                }
            );


        const data =
            await response.json();


        if (
            response.status === 401
        ) {

            showToast(
                "로그인이 필요합니다."
            );


            setTimeout(function () {

                window.location.href =
                    "login.html";

            }, 700);

            return;
        }


        if (!response.ok) {

            showToast(
                data.message ||
                "모임 생성에 실패했습니다."
            );

            return;
        }


        showToast(
            "모임이 생성되었습니다."
        );


        setTimeout(function () {

            window.location.href =
                "index.html";

        }, 700);

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


document
    .getElementById(
        "createMeetingButton"
    )
    .addEventListener(
        "click",
        createMeeting
    );


loadSports();