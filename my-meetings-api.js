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


// 내가 만든 모임 조회
async function loadMyMeetings() {

    try {

        const response =
            await fetch(
                "/api/users/me/meetings"
            );


        const data =
            await response.json();


        if (
            response.status === 401
        ) {

            showToast(
                "로그인이 필요합니다."
            );


            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                700
            );


            return;
        }


        if (!response.ok) {

            showToast(
                data.message ||
                "내 모임을 불러오지 못했습니다."
            );

            return;
        }


        document
            .getElementById(
                "myMeetingCount"
            )
            .textContent =
                `내가 만든 모임 ${data.total}개`;


        showMyMeetings(
            data.meetings
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


// 모임 카드 표시
function showMyMeetings(meetings) {

    const list =
        document.getElementById(
            "myMeetingsList"
        );


    list.innerHTML =
        "";


    if (
        !meetings ||
        meetings.length === 0
    ) {

        list.innerHTML = `
            <div class="panel">

                <h3>
                    아직 만든 모임이 없습니다.
                </h3>

                <p class="subtle">
                    새로운 모임을 만들어보세요.
                </p>

                <a
                    href="create.html"
                    class="btn blue"
                    style="margin-top:12px"
                >
                    모임 만들기
                </a>

            </div>
        `;


        return;
    }


    meetings.forEach(
        function (meeting) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "panel";


            let statusText =
                meeting.status;


            if (
                meeting.status ===
                "RECRUITING"
            ) {

                statusText =
                    "모집 중";

            }

            else if (
                meeting.status ===
                "CLOSED"
            ) {

                statusText =
                    "모집 마감";

            }

            else if (
                meeting.status ===
                "COMPLETED"
            ) {

                statusText =
                    "모임 완료";

            }

            else if (
                meeting.status ===
                "CANCELED"
            ) {

                statusText =
                    "모임 취소";
            }


            card.innerHTML = `

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        gap:10px;
                    "
                >

                    <strong>
                        ${meeting.sport_name}
                    </strong>

                    <span class="subtle">
                        ${statusText}
                    </span>

                </div>


                <h2
                    style="margin-top:12px"
                >
                    ${meeting.title}
                </h2>


                <div
                    style="
                        display:grid;
                        gap:6px;
                        margin-top:16px;
                    "
                >

                    <div>
                        📅 ${meeting.meeting_date}
                    </div>

                    <div>
                        📍 ${meeting.location}
                    </div>

                </div>


                <a
                    href="detail.html?meeting_id=${meeting.id}"
                    class="btn blue"
                    style="margin-top:18px"
                >
                    관리하기
                </a>
            `;


            list.appendChild(
                card
            );
        }
    );
}


loadMyMeetings();