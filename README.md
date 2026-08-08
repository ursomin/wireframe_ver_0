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
- `my-meetings.html` — 내 모임 / 신청 모임 / 일정
- `host-manage.html` — 호스트 신청자 승인·거절
- `attendance.html` — 출석 관리
- `review.html` — 후기·매너·실력 신뢰도 평가
- `chat.html` — 모임톡 / 개인톡 화면
- `friends.html` — 친구 / 재매칭
- `profile.html` — 프로필 / 운동 프로필 / 신뢰도
- `notifications.html` — 알림
- `admin/index.html` — 관리자 대시보드
- `admin/users.html` — 관리자 회원 관리
- `admin/meetings.html` — 관리자 모임 관리
- `admin/reports.html` — 관리자 신고 관리
- `admin/sports.html` — 관리자 종목 관리
- `admin/stats.html` — 관리자 운영 통계

## 구현하지 않은 것
- 실제 회원 인증/권한 검사
- 서버/DB 저장
- 실시간 WebSocket 채팅
- 지도/체육시설 OpenAPI
- 이메일/SMS 발송
- 실제 관리자 권한 검증

화면 검토를 위해 버튼/탭/모달/정렬/위치 권한 요청 등 일부 인터랙션만 JavaScript로 흉내 냈습니다.
