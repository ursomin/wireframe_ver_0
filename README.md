# PLAYUPP Static Prototype

서버/DB/API 없이 화면 구성과 사용자 흐름을 검토하기 위한 정적 웹 프로토타입입니다.

## 실행
VS Code에서 폴더를 열고 `index.html`을 Live Server로 실행하는 방식을 권장합니다.

또는 터미널:
```bash
python -m http.server 8000
```
그 뒤 `http://localhost:8000` 접속.

관리자 페이지:
`http://localhost:8000/admin/`

## 페이지
- `index.html` — 홈 / 모임 찾기
- `login.html` — 로그인
- `signup.html` — 회원가입
- `onboarding.html` — 운동 프로필 초기 설정
- `create.html` — 모임 생성
- `detail.html` — 모임 상세 + 참여 신청 모달
- `my-meetings.html` — 참여 중인 모임 / 완료 모임 / 실력 평가
- `room-manage.html` — 내가 만든 모임의 참가 신청 승인·거절, 참여자 프로필 확인과 강퇴
- `host-manage.html` — 호스트 신청자 승인·거절
- `attendance.html` — 출석 관리
- `review.html` — 운동 후 상호 실력 평가
- `chat.html` — 모임톡 / 개인톡 화면
- `friends.html` — 친구 / 재매칭
- `profile.html` — 내 프로필 / 운동 프로필 / 상세 참여율
- `user-profile.html` — 상대 프로필 / 친구 / 차단 / 사용자 신고
- `community.html` — 커뮤니티 / 공지사항 / 글쓰기
- `notifications.html` — 알림
- `admin/index.html` — 관리자 대시보드
- `admin/users.html` — 관리자 회원 관리
- `admin/meetings.html` — 관리자 모임 관리
- `admin/reports.html` — 관리자 신고 관리
- `admin/sports.html` — 관리자 종목 관리
- `admin/stats.html` — 관리자 운영 통계

## 정적 프로토타입에서 동작하는 것
- `localStorage`를 이용한 프로필, 찜, 친구, 차단, 모임, 신청 상태 저장
- 홈 검색·필터·정렬과 종목별 모임 상세 연결
- 모임 생성·참여 신청·취소·호스트 승인·출석·실력 평가 흐름
- 모임톡·개인톡 메시지 입력과 완료 모임 채팅방 유지 예시
- 커뮤니티 글쓰기·검색·게시판 필터와 알림 읽음 처리
- 사용자·모임 신고 접수 및 관리자 신고 목록 연동
- 관리자 검색·상태 처리·CSV 내보내기 예시

## 서버 연동 후 구현할 것
- 실제 회원 인증/권한 검사
- 서버/DB 저장
- 실시간 WebSocket 채팅
- 지도/체육시설 OpenAPI
- 이메일/SMS 발송
- 실제 관리자 권한 검증

모든 상태는 같은 브라우저의 `localStorage`에만 저장됩니다. 실제 서비스 데이터가 아니며 브라우저 저장 데이터를 삭제하면 초기화됩니다.
