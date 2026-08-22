"use strict";


let currentMeeting = null;

let sports = [];


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


// 주소에서 meeting_id 가져오기
function getMeetingId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get(
        "meeting_id"
    );
}


// 종목 목록 조회
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


        sports =
            data.sports || [];


        const select =
            document.getElementById(
                "editMeetingSport"
            );


        select.innerHTML =
            '<option value="">종목 선택</option>';


        sports.forEach(
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


// 모임 상세 조회
async function loadMeeting() {

    const meetingId =
        getMeetingId();


    if (!meetingId) {

        showToast(
            "모임 번호가 없습니다."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `/api/meetings/${meetingId}`
            );


        const data =
            await response.json();


        if (
            response.status === 404
        ) {

            showToast(
                "존재하지 않는 모임입니다."
            );

            return;
        }


        if (!response.ok) {

            showToast(
                data.message ||
                "모임 정보를 불러오지 못했습니다."
            );

            return;
        }


        currentMeeting =
            data;


        showMeeting(
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


// 모임 화면 표시
function showMeeting(meeting) {

    document
        .getElementById(
            "meetingTitle"
        )
        .textContent =
            meeting.title;


    document
        .getElementById(
            "meetingSport"
        )
        .textContent =
            meeting.sport_name;


    document
        .getElementById(
            "detailSport"
        )
        .textContent =
            meeting.sport_name;


    document
        .getElementById(
            "detailHost"
        )
        .textContent =
            meeting.host_name;


    document
        .getElementById(
            "detailDate"
        )
        .textContent =
            meeting.meeting_date;


    document
        .getElementById(
            "detailLocation"
        )
        .textContent =
            meeting.location;


    document
        .getElementById(
            "detailMaxMembers"
        )
        .textContent =
            `${meeting.max_members}명`;


    let approvalText =
        "모임장 승인";


    if (
        meeting.approval_type ===
        "INSTANT"
    ) {

        approvalText =
            "즉시 참여";
    }


    document
        .getElementById(
            "detailApprovalType"
        )
        .textContent =
            approvalText;


    let statusText =
        meeting.status;


    if (
        meeting.status ===
        "RECRUITING"
    ) {

        statusText =
            "모집 중";
    }


    document
        .getElementById(
            "detailStatus"
        )
        .textContent =
            statusText;


    document
        .getElementById(
            "detailDescription"
        )
        .textContent =
            meeting.description;
}


// 참여 신청
async function joinMeeting() {

    const meetingId =
        getMeetingId();


    try {

        const response =
            await fetch(
                `/api/meetings/${meetingId}/participants`,
                {
                    method: "POST"
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

            return;
        }


        if (
            response.status === 409
        ) {

            if (
                data.message ===
                "Already Participated"
            ) {

                showToast(
                    "이미 참여 신청 기록이 있습니다."
                );

            }

            else if (
                data.message ===
                "Meeting Full"
            ) {

                showToast(
                    "모임 정원이 가득 찼습니다."
                );

            }

            else {

                showToast(
                    data.message
                );
            }


            return;
        }


        if (!response.ok) {

            showToast(
                data.message ||
                "참여 신청에 실패했습니다."
            );

            return;
        }


        if (
            currentMeeting &&
            currentMeeting.approval_type ===
            "INSTANT"
        ) {

            showToast(
                "모임에 참여되었습니다."
            );

        }

        else {

            showToast(
                "참여 신청이 완료되었습니다. 모임장 승인을 기다려주세요."
            );
        }


        await loadHostManagement();

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


// 내 참여 취소
async function cancelParticipation() {

    const meetingId =
        getMeetingId();


    const confirmed =
        confirm(
            "참여 신청 또는 참여를 취소하시겠습니까?"
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
                `/api/meetings/${meetingId}/participants/me`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (
            response.status === 404
        ) {

            showToast(
                "참여 신청 기록이 없습니다."
            );

            return;
        }


        if (!response.ok) {

            showToast(
                data.message ||
                "참여 취소에 실패했습니다."
            );

            return;
        }


        showToast(
            "참여가 취소되었습니다."
        );


        await loadHostManagement();

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


// 모임장인지 확인하면서 신청 목록 조회
async function loadHostManagement() {

    const meetingId =
        getMeetingId();


    const hostPanel =
        document.getElementById(
            "hostManagement"
        );


    try {

        const response =
            await fetch(
                `/api/meetings/${meetingId}/participants`
            );


        if (
            response.status === 403
        ) {

            hostPanel.style.display =
                "none";

            return;
        }


        if (
            response.status === 401
        ) {

            hostPanel.style.display =
                "none";

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            hostPanel.style.display =
                "none";

            return;
        }


        // GET participants는 모임장만 성공하므로
        // 여기까지 왔다면 현재 사용자는 모임장
        hostPanel.style.display =
            "block";


        showPendingParticipants(
            data
        );


        await loadApprovedParticipants();

    }

    catch (error) {

        console.error(
            error
        );
    }
}


// 승인 대기 신청자 표시
function showPendingParticipants(
    participants
) {

    const list =
        document.getElementById(
            "pendingParticipants"
        );


    list.innerHTML =
        "";


    if (
        !participants ||
        participants.length === 0
    ) {

        list.innerHTML = `
            <div class="subtle">
                승인 대기 중인 신청자가 없습니다.
            </div>
        `;

        return;
    }


    participants.forEach(
        function (participant) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "panel";


            item.innerHTML = `
                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:12px;
                        flex-wrap:wrap;
                    "
                >

                    <div>

                        <strong>
                            사용자 ${participant.user_id}
                        </strong>

                        <div
                            class="subtle"
                            style="margin-top:4px"
                        >
                            상태:
                            ${participant.participation_status}
                        </div>

                    </div>


                    <div
                        style="
                            display:flex;
                            gap:8px;
                        "
                    >

                        <button
                            class="btn blue"
                            type="button"
                            onclick="approveParticipant(${participant.user_id})"
                        >
                            승인
                        </button>

                        <button
                            class="btn"
                            type="button"
                            onclick="rejectParticipant(${participant.user_id})"
                        >
                            거절
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


// 참가 승인
async function approveParticipant(
    userId
) {

    const meetingId =
        getMeetingId();


    const response =
        await fetch(
            `/api/meetings/${meetingId}/participants/${userId}/approve`,
            {
                method: "POST"
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        showToast(
            data.message ||
            "승인에 실패했습니다."
        );

        return;
    }


    showToast(
        "참가 신청을 승인했습니다."
    );


    await loadHostManagement();
}


// 참가 거절
async function rejectParticipant(
    userId
) {

    const meetingId =
        getMeetingId();


    const response =
        await fetch(
            `/api/meetings/${meetingId}/participants/${userId}/reject`,
            {
                method: "POST"
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        showToast(
            data.message ||
            "거절에 실패했습니다."
        );

        return;
    }


    showToast(
        "참가 신청을 거절했습니다."
    );


    await loadHostManagement();
}


// 승인된 현재 참여자 조회
async function loadApprovedParticipants() {

    const meetingId =
        getMeetingId();


    try {

        const response =
            await fetch(
                `/api/meetings/${meetingId}/participants/approved`
            );


        const data =
            await response.json();


        if (!response.ok) {

            return;
        }


        showApprovedParticipants(
            data
        );

    }

    catch (error) {

        console.error(
            error
        );
    }
}


// 승인된 참여자 표시
function showApprovedParticipants(
    participants
) {

    const list =
        document.getElementById(
            "approvedParticipants"
        );


    list.innerHTML =
        "";


    if (
        !participants ||
        participants.length === 0
    ) {

        list.innerHTML = `
            <div class="subtle">
                현재 승인된 참여자가 없습니다.
            </div>
        `;

        return;
    }


    participants.forEach(
        function (participant) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "panel";


            let attendanceText =
                "미처리";


            if (
                participant.attendance_status ===
                "ATTENDED"
            ) {

                attendanceText =
                    "출석";

            }

            else if (
                participant.attendance_status ===
                "NO_SHOW"
            ) {

                attendanceText =
                    "No-Show";
            }


            item.innerHTML = `
                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:12px;
                        flex-wrap:wrap;
                    "
                >

                    <div>

                        <strong>
                            사용자 ${participant.user_id}
                        </strong>

                        <div
                            class="subtle"
                            style="margin-top:4px"
                        >
                            출석 상태:
                            ${attendanceText}
                        </div>

                    </div>


                    <div
                        style="
                            display:flex;
                            gap:8px;
                            flex-wrap:wrap;
                        "
                    >

                        <button
                            class="btn blue"
                            type="button"
                            onclick="updateAttendance(${participant.user_id}, 'ATTENDED')"
                        >
                            출석
                        </button>

                        <button
                            class="btn"
                            type="button"
                            onclick="updateAttendance(${participant.user_id}, 'NO_SHOW')"
                        >
                            No-Show
                        </button>

                        <button
                            class="btn"
                            type="button"
                            onclick="kickParticipant(${participant.user_id})"
                        >
                            강퇴
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


// 출석 / 노쇼 처리
async function updateAttendance(
    userId,
    attendanceStatus
) {

    const meetingId =
        getMeetingId();


    const response =
        await fetch(
            `/api/meetings/${meetingId}/participants/${userId}/attendance`,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        attendance_status:
                            attendanceStatus
                    })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        showToast(
            data.message ||
            "출석 처리에 실패했습니다."
        );

        return;
    }


    if (
        attendanceStatus ===
        "ATTENDED"
    ) {

        showToast(
            "출석 처리되었습니다."
        );

    }

    else {

        showToast(
            "No-Show 처리되었습니다."
        );
    }


    await loadApprovedParticipants();
}


// 참여자 강퇴
async function kickParticipant(
    userId
) {

    const meetingId =
        getMeetingId();


    const confirmed =
        confirm(
            `사용자 ${userId}번을 강퇴하시겠습니까?`
        );


    if (!confirmed) {

        return;
    }


    const response =
        await fetch(
            `/api/meetings/${meetingId}/participants/${userId}`,
            {
                method:
                    "DELETE"
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        showToast(
            data.message ||
            "강퇴에 실패했습니다."
        );

        return;
    }


    showToast(
        "참여자를 강퇴했습니다."
    );


    await loadHostManagement();
}


// 수정 화면 열기
function openEditMode() {

    if (!currentMeeting) {
        return;
    }


    document
        .getElementById(
            "editMeetingTitle"
        )
        .value =
            currentMeeting.title;


    document
        .getElementById(
            "editMeetingDate"
        )
        .value =
            currentMeeting.meeting_date;


    document
        .getElementById(
            "editMeetingLocation"
        )
        .value =
            currentMeeting.location;


    document
        .getElementById(
            "editMeetingMaxMembers"
        )
        .value =
            currentMeeting.max_members;


    document
        .getElementById(
            "editMeetingDescription"
        )
        .value =
            currentMeeting.description;


    document
        .getElementById(
            "editMeetingSport"
        )
        .value =
            currentMeeting.sport_id;


    document
        .getElementById(
            "meetingView"
        )
        .style.display =
            "none";


    document
        .getElementById(
            "meetingEdit"
        )
        .style.display =
            "block";
}


// 수정 취소
function closeEditMode() {

    document
        .getElementById(
            "meetingEdit"
        )
        .style.display =
            "none";


    document
        .getElementById(
            "meetingView"
        )
        .style.display =
            "block";
}


// 모임 수정
async function updateMeeting() {

    const meetingId =
        getMeetingId();


    const title =
        document
            .getElementById(
                "editMeetingTitle"
            )
            .value
            .trim();


    const sportId =
        document
            .getElementById(
                "editMeetingSport"
            )
            .value;


    const meetingDate =
        document
            .getElementById(
                "editMeetingDate"
            )
            .value;


    const meetingLocation =
        document
            .getElementById(
                "editMeetingLocation"
            )
            .value
            .trim();


    const maxMembers =
        document
            .getElementById(
                "editMeetingMaxMembers"
            )
            .value;


    const description =
        document
            .getElementById(
                "editMeetingDescription"
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


    const response =
        await fetch(
            `/api/meetings/${meetingId}`,
            {
                method:
                    "PUT",

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
                            ),

                        status:
                            currentMeeting.status
                    })
            }
        );


    const data =
        await response.json();


    if (
        response.status === 403
    ) {

        showToast(
            "이 모임을 수정할 권한이 없습니다."
        );

        return;
    }


    if (!response.ok) {

        showToast(
            data.message ||
            "모임 수정에 실패했습니다."
        );

        return;
    }


    showToast(
        "모임이 수정되었습니다."
    );


    await loadMeeting();

    closeEditMode();
}


// 모임 삭제
async function deleteMeeting() {

    const meetingId =
        getMeetingId();


    if (
        !confirm(
            "정말 이 모임을 삭제하시겠습니까?"
        )
    ) {

        return;
    }


    const response =
        await fetch(
            `/api/meetings/${meetingId}`,
            {
                method:
                    "DELETE"
            }
        );


    if (
        response.status === 204
    ) {

        alert(
            "모임이 삭제되었습니다."
        );


        window.location.href =
            "index.html";


        return;
    }


    let data = {};


    try {

        data =
            await response.json();

    }

    catch (error) {

        console.error(
            error
        );
    }


    showToast(
        data.message ||
        "모임 삭제에 실패했습니다."
    );
}


// 버튼 연결
document
    .getElementById(
        "joinMeetingButton"
    )
    .addEventListener(
        "click",
        joinMeeting
    );


document
    .getElementById(
        "cancelParticipationButton"
    )
    .addEventListener(
        "click",
        cancelParticipation
    );


document
    .getElementById(
        "editMeetingButton"
    )
    .addEventListener(
        "click",
        openEditMode
    );


document
    .getElementById(
        "cancelMeetingButton"
    )
    .addEventListener(
        "click",
        closeEditMode
    );


document
    .getElementById(
        "saveMeetingButton"
    )
    .addEventListener(
        "click",
        updateMeeting
    );


document
    .getElementById(
        "deleteMeetingButton"
    )
    .addEventListener(
        "click",
        deleteMeeting
    );


// 페이지 시작
async function start() {

    await loadSports();

    await loadMeeting();

    await loadHostManagement();
}


start();