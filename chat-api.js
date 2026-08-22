"use strict";


let socket = null;

let currentRoomId = null;


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


// Socket.IO 서버 연결
function connectSocket() {

    socket = io();


    // 서버 연결 성공
    socket.on(
        "connect",
        function () {

            document
                .getElementById(
                    "socketStatus"
                )
                .textContent =
                    "실시간 서버 연결됨";


            console.log(
                "Socket.IO 서버 연결 성공"
            );
        }
    );


    // 서버 연결 종료
    socket.on(
        "disconnect",
        function () {

            document
                .getElementById(
                    "socketStatus"
                )
                .textContent =
                    "실시간 서버 연결 종료";


            console.log(
                "Socket.IO 서버 연결 종료"
            );
        }
    );


    // 연결 실패
    socket.on(
        "connect_error",
        function (error) {

            console.error(
                "Socket.IO 연결 오류:",
                error
            );


            document
                .getElementById(
                    "socketStatus"
                )
                .textContent =
                    "실시간 서버 연결 실패";
        }
    );


    // 채팅방 입장 성공
    socket.on(
        "joined_room",
        function (data) {

            console.log(
                "채팅방 입장:",
                data.chat_room_id
            );
        }
    );


    // 채팅방 퇴장 성공
    socket.on(
        "left_room",
        function (data) {

            console.log(
                "채팅방 퇴장:",
                data.chat_room_id
            );
        }
    );


    // 실시간 메시지 수신
    socket.on(
        "receive_message",
        function (data) {

            // 현재 보고 있는 채팅방 메시지만 표시
            if (
                Number(
                    data.chat_room_id
                )
                !==
                Number(
                    currentRoomId
                )
            ) {

                return;
            }


            appendMessage(
                data
            );
        }
    );


    // 서버에서 채팅 오류 발생
    socket.on(
        "chat_error",
        function (data) {

            showToast(
                data.message ||
                "채팅 오류"
            );
        }
    );
}


// 내 채팅방 목록 조회
async function loadChatRooms() {

    try {

        const response =
            await fetch(
                "/api/chat/rooms"
            );


        const data =
            await response.json();


        // 로그인 안 된 경우
        if (
            response.status === 401
        ) {

            window.location.href =
                "login.html";

            return;
        }


        if (!response.ok) {

            showToast(
                data.message ||
                "채팅방 조회 실패"
            );

            return;
        }


        showChatRooms(
            data
        );

    }

    catch (error) {

        console.error(
            "채팅방 조회 오류:",
            error
        );


        showToast(
            "채팅방을 불러오지 못했습니다."
        );
    }
}


// 채팅방 목록 화면에 표시
function showChatRooms(rooms) {

    const list =
        document.getElementById(
            "chatRoomList"
        );


    list.innerHTML =
        "";


    // 채팅방이 없는 경우
    if (
        !rooms ||
        rooms.length === 0
    ) {

        list.innerHTML = `
            <div class="subtle">
                참여 중인 채팅방이 없습니다.
            </div>
        `;

        return;
    }


    rooms.forEach(
        function (room) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "btn";


            button.style.width =
                "100%";


            button.style.textAlign =
                "left";


            button.textContent =
                `${room.sport_name} · ${room.title}`;


            // 채팅방 클릭
            button.addEventListener(
                "click",
                function () {

                    selectRoom(
                        room
                    );
                }
            );


            list.appendChild(
                button
            );
        }
    );


    // 첫 번째 채팅방 자동 선택
    selectRoom(
        rooms[0]
    );
}


// 채팅방 선택
async function selectRoom(room) {

    const newRoomId =
        room.chat_room_id;


    // 이미 같은 방이면 다시 입장할 필요 없음
    if (
        Number(currentRoomId) ===
        Number(newRoomId)
    ) {

        return;
    }


    // 기존 Socket.IO room에서 퇴장
    if (
        currentRoomId &&
        socket &&
        socket.connected
    ) {

        socket.emit(
            "leave_room",
            {
                chat_room_id:
                    currentRoomId
            }
        );
    }


    // 새 채팅방 번호 저장
    currentRoomId =
        newRoomId;


    // 채팅방 제목 변경
    document
        .getElementById(
            "currentRoomTitle"
        )
        .textContent =
            room.title;


    // 메시지 입력 활성화
    document
        .getElementById(
            "messageInput"
        )
        .disabled =
            false;


    document
        .getElementById(
            "sendMessageButton"
        )
        .disabled =
            false;


    // GET으로 과거 메시지 조회
    await loadMessages(
        newRoomId
    );


    // GET으로 채팅방 멤버 조회
    await loadMembers(
        newRoomId
    );


    // Socket.IO 새 room 입장
    if (
        socket &&
        socket.connected
    ) {

        socket.emit(
            "join_room",
            {
                chat_room_id:
                    newRoomId
            }
        );
    }
}


// 과거 메시지 조회
async function loadMessages(
    chatRoomId
) {

    const list =
        document.getElementById(
            "messageList"
        );


    list.innerHTML = `
        <div class="subtle">
            메시지를 불러오는 중...
        </div>
    `;


    try {

        const response =
            await fetch(
                `/api/chat/rooms/${chatRoomId}/messages`
            );


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "메시지 조회 실패"
            );

            return;
        }


        list.innerHTML =
            "";


        // 과거 메시지가 없는 경우
        if (
            data.length === 0
        ) {

            list.innerHTML = `
                <div class="subtle">
                    아직 메시지가 없습니다.
                </div>
            `;

            return;
        }


        // DB에서 가져온 메시지 출력
        data.forEach(
            function (message) {

                appendMessage(
                    message
                );
            }
        );

    }

    catch (error) {

        console.error(
            "메시지 조회 오류:",
            error
        );


        showToast(
            "메시지를 불러오지 못했습니다."
        );
    }
}


// 메시지 하나 화면에 표시
function appendMessage(message) {

    const list =
        document.getElementById(
            "messageList"
        );


    // 아직 메시지가 없습니다 문구 제거
    if (
        list.children.length === 1 &&
        list.firstElementChild &&
        list.firstElementChild.classList.contains(
            "subtle"
        )
    ) {

        list.innerHTML =
            "";
    }


    const item =
        document.createElement(
            "div"
        );


    item.style.padding =
        "10px 12px";


    item.style.border =
        "1px solid #e5e7eb";


    item.style.borderRadius =
        "10px";


    // 닉네임
    const name =
        document.createElement(
            "strong"
        );


    name.textContent =
        message.nickname ||
        `사용자 ${message.sender_id}`;


    // 시간
    const time =
        document.createElement(
            "span"
        );


    time.className =
        "subtle";


    time.style.marginLeft =
        "8px";


    time.style.fontSize =
        "12px";


    time.textContent =
        message.created_at ||
        "";


    // 메시지 내용
    const content =
        document.createElement(
            "div"
        );


    content.style.marginTop =
        "6px";


    content.textContent =
        message.content;


    item.appendChild(
        name
    );


    item.appendChild(
        time
    );


    item.appendChild(
        content
    );


    list.appendChild(
        item
    );


    // 최근 메시지로 스크롤
    list.scrollTop =
        list.scrollHeight;
}


// 채팅방 멤버 조회
async function loadMembers(
    chatRoomId
) {

    try {

        const response =
            await fetch(
                `/api/chat/rooms/${chatRoomId}/members`
            );


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "채팅방 멤버 조회 실패"
            );

            return;
        }


        showMembers(
            data
        );

    }

    catch (error) {

        console.error(
            "멤버 조회 오류:",
            error
        );
    }
}


// 멤버 화면에 표시
function showMembers(members) {

    const list =
        document.getElementById(
            "memberList"
        );


    list.innerHTML =
        "";


    if (
        !members ||
        members.length === 0
    ) {

        list.textContent =
            "멤버가 없습니다.";

        return;
    }


    members.forEach(
        function (member) {

            const item =
                document.createElement(
                    "div"
                );


            item.style.display =
                "flex";


            item.style.alignItems =
                "center";


            item.style.gap =
                "8px";


            // 프로필 이미지가 있는 경우
            if (
                member.profile_image
            ) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    member.profile_image;


                image.alt =
                    "프로필";


                image.style.width =
                    "34px";


                image.style.height =
                    "34px";


                image.style.borderRadius =
                    "50%";


                image.style.objectFit =
                    "cover";


                item.appendChild(
                    image
                );

            }

            // 프로필 이미지가 없는 경우
            else {

                const avatar =
                    document.createElement(
                        "span"
                    );


                avatar.className =
                    "avatar";


                avatar.textContent =
                    member.nickname
                        ? member.nickname.charAt(0)
                        : "?";


                item.appendChild(
                    avatar
                );
            }


            const name =
                document.createElement(
                    "span"
                );


            name.textContent =
                member.nickname;


            item.appendChild(
                name
            );


            list.appendChild(
                item
            );
        }
    );
}


// 메시지 전송
function sendMessage() {

    if (
        !currentRoomId ||
        !socket ||
        !socket.connected
    ) {

        showToast(
            "채팅 서버에 연결되어 있지 않습니다."
        );

        return;
    }


    const input =
        document.getElementById(
            "messageInput"
        );


    const content =
        input.value.trim();


    if (!content) {

        return;
    }


    // 클라이언트 → 서버
    socket.emit(
        "send_message",
        {
            chat_room_id:
                currentRoomId,

            content:
                content
        }
    );


    // 여기서는 화면에 직접 메시지를 추가하지 않음
    // 서버가 DB 저장 성공 후 receive_message로 다시 보냄
    input.value =
        "";


    input.focus();
}


// 전송 버튼
document
    .getElementById(
        "sendMessageButton"
    )
    .addEventListener(
        "click",
        sendMessage
    );


// Enter 키로 전송
document
    .getElementById(
        "messageInput"
    )
    .addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                sendMessage();
            }
        }
    );


// 페이지를 나갈 때
// 1. 현재 채팅방 퇴장
// 2. Socket.IO 연결 종료
window.addEventListener(
    "beforeunload",
    function () {

        // 현재 채팅방에서 퇴장
        if (
            socket &&
            socket.connected &&
            currentRoomId
        ) {

            socket.emit(
                "leave_room",
                {
                    chat_room_id:
                        currentRoomId
                }
            );
        }


        // Socket.IO 서버 연결 자체 종료
        if (
            socket &&
            socket.connected
        ) {

            socket.disconnect();
        }
    }
);


// 페이지 시작
async function start() {

    // Socket.IO 연결
    connectSocket();


    // 서버 연결이 완료될 때까지 기다렸다가
    // 채팅방 목록을 가져오는 것은 아니어도 됨.
    // GET API와 Socket.IO는 별도로 동작함.
    await loadChatRooms();
}


start();