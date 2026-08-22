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


// 종목 필터 목록 준비
async function loadSports() {

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
                "sportFilter"
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
    }
}


// 현재 검색 조건으로 URL 생성
function makeMeetingsUrl() {

    const keyword =
        document
            .getElementById(
                "keywordInput"
            )
            .value
            .trim();


    const sportId =
        document
            .getElementById(
                "sportFilter"
            )
            .value;


    const meetingDate =
        document
            .getElementById(
                "dateFilter"
            )
            .value;


    const meetingLocation =
        document
            .getElementById(
                "locationFilter"
            )
            .value
            .trim();


    const status =
        document
            .getElementById(
                "statusFilter"
            )
            .value;


    const params =
        new URLSearchParams();


    if (keyword) {

        params.append(
            "keyword",
            keyword
        );
    }


    if (sportId) {

        params.append(
            "sport_id",
            sportId
        );
    }


    if (meetingDate) {

        params.append(
            "date",
            meetingDate
        );
    }


    if (meetingLocation) {

        params.append(
            "location",
            meetingLocation
        );
    }


    if (status) {

        params.append(
            "status",
            status
        );
    }


    const query =
        params.toString();


    if (query) {

        return (
            "/api/meetings?"
            + query
        );
    }


    return "/api/meetings";
}


// 모임 목록 조회
async function loadMeetings() {

    const list =
        document.getElementById(
            "meetingsList"
        );


    list.innerHTML = `
        <div class="panel">
            모임 정보를 불러오는 중...
        </div>
    `;


    try {

        const url =
            makeMeetingsUrl();


        const response =
            await fetch(
                url
            );


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "모임 목록 조회 실패"
            );

            return;
        }


        document
            .getElementById(
                "meetingCount"
            )
            .textContent =
                `검색 결과 ${data.total}개`;


        showMeetings(
            data.meetings
        );

    }

    catch (error) {

        console.error(
            error
        );


        list.innerHTML = `
            <div class="panel">
                서버와 연결할 수 없습니다.
            </div>
        `;
    }
}


// 모임 카드 표시
function showMeetings(meetings) {

    const list =
        document.getElementById(
            "meetingsList"
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
                    검색 결과가 없습니다.
                </h3>

                <p class="subtle">
                    다른 검색 조건을 사용해보세요.
                </p>

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
                        margin-bottom:10px;
                    "
                >

                    <strong>
                        ${meeting.sport_name}
                    </strong>

                    <span class="subtle">
                        ${statusText}
                    </span>

                </div>


                <h2>
                    ${meeting.title}
                </h2>


                <p
                    class="subtle"
                    style="margin-top:8px"
                >
                    ${meeting.description || ""}
                </p>


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

                    <div>
                        👥 최대 ${meeting.max_members}명
                    </div>

                    <div>
                        👤 모임장 ${meeting.host_name}
                    </div>

                </div>


                <a
                    href="detail.html?meeting_id=${meeting.id}"
                    class="btn blue"
                    style="margin-top:18px"
                >
                    상세 보기
                </a>
            `;


            list.appendChild(
                card
            );
        }
    );
}


// 검색 조건 초기화
function resetFilters() {

    document
        .getElementById(
            "keywordInput"
        )
        .value =
            "";


    document
        .getElementById(
            "sportFilter"
        )
        .value =
            "";


    document
        .getElementById(
            "dateFilter"
        )
        .value =
            "";


    document
        .getElementById(
            "locationFilter"
        )
        .value =
            "";


    document
        .getElementById(
            "statusFilter"
        )
        .value =
            "";


    loadMeetings();
}


// Enter로 검색
document
    .getElementById(
        "keywordInput"
    )
    .addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                loadMeetings();
            }
        }
    );


document
    .getElementById(
        "searchButton"
    )
    .addEventListener(
        "click",
        loadMeetings
    );


document
    .getElementById(
        "resetButton"
    )
    .addEventListener(
        "click",
        resetFilters
    );


async function start() {

    await loadSports();

    await loadMeetings();
}


start();