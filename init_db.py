import sqlite3


connection = sqlite3.connect(
    "playupp.db"
)

connection.execute(
    "PRAGMA foreign_keys = ON"
)

cursor = connection.cursor()


# 사용자
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        login_id TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nickname TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        profile_image TEXT,
        birth_date TEXT NOT NULL,
        gender TEXT NOT NULL,
        region TEXT NOT NULL,
        role TEXT DEFAULT 'USER',
        status TEXT DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """
)


# 운동 종목
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS sports (
        sport_id INTEGER PRIMARY KEY AUTOINCREMENT,
        sport_name TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'ACTIVE'
    )
    """
)


# 기존 sports 테이블 migration
cursor.execute(
    """
    PRAGMA table_info(sports)
    """
)

sports_columns = [
    row[1]
    for row in cursor.fetchall()
]


if "status" not in sports_columns:

    cursor.execute(
        """
        ALTER TABLE sports
        ADD COLUMN status TEXT DEFAULT 'ACTIVE'
        """
    )


# 사용자 운동 프로필
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS user_sports (
        user_id INTEGER NOT NULL,
        sport_id INTEGER NOT NULL,
        skill_level TEXT NOT NULL,

        PRIMARY KEY (
            user_id,
            sport_id
        ),

        FOREIGN KEY (user_id)
            REFERENCES users(user_id),

        FOREIGN KEY (sport_id)
            REFERENCES sports(sport_id)
    )
    """
)


# 모임
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host_id INTEGER NOT NULL,
        sport_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        meeting_date TEXT NOT NULL,
        location TEXT NOT NULL,
        max_members INTEGER NOT NULL,
        approval_type TEXT DEFAULT 'HOST_APPROVAL',
        status TEXT DEFAULT 'RECRUITING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (host_id)
            REFERENCES users(user_id),

        FOREIGN KEY (sport_id)
            REFERENCES sports(sport_id)
    )
    """
)


# 기존 meetings에 approval_type 없는 경우
cursor.execute(
    """
    PRAGMA table_info(meetings)
    """
)

meeting_columns = [
    row[1]
    for row in cursor.fetchall()
]


if "approval_type" not in meeting_columns:

    cursor.execute(
        """
        ALTER TABLE meetings
        ADD COLUMN approval_type TEXT
        DEFAULT 'HOST_APPROVAL'
        """
    )


cursor.execute(
    """
    UPDATE meetings
    SET approval_type = 'HOST_APPROVAL'
    WHERE approval_type IS NULL
    """
)


# 기존 B 테이블
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS meeting_members (
        meeting_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,

        PRIMARY KEY (
            meeting_id,
            user_id
        ),

        FOREIGN KEY (meeting_id)
            REFERENCES meetings(id),

        FOREIGN KEY (user_id)
            REFERENCES users(user_id)
    )
    """
)


# C 참여자
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS meeting_participants (
        meeting_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        participation_status TEXT NOT NULL,
        attendance_status TEXT,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved_at DATETIME,
        canceled_at DATETIME,

        PRIMARY KEY (
            meeting_id,
            user_id
        ),

        FOREIGN KEY (meeting_id)
            REFERENCES meetings(id),

        FOREIGN KEY (user_id)
            REFERENCES users(user_id)
    )
    """
)


# D - 채팅방
# 모임 하나당 채팅방 하나
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS chat_rooms (
        chat_room_id INTEGER PRIMARY KEY AUTOINCREMENT,
        meeting_id INTEGER UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (meeting_id)
            REFERENCES meetings(id)
    )
    """
)


# D - 채팅방 멤버
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS chat_room_members (
        chat_room_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (
            chat_room_id,
            user_id
        ),

        FOREIGN KEY (chat_room_id)
            REFERENCES chat_rooms(chat_room_id),

        FOREIGN KEY (user_id)
            REFERENCES users(user_id)
    )
    """
)


# D - 채팅 메시지
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS chat_messages (
        message_id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_room_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (chat_room_id)
            REFERENCES chat_rooms(chat_room_id),

        FOREIGN KEY (sender_id)
            REFERENCES users(user_id)
    )
    """
)


# 기본 종목
default_sports = [
    "배드민턴",
    "탁구",
    "테니스",
    "풋살",
    "농구",
    "축구",
    "러닝",
    "야구"
]


for sport_name in default_sports:

    cursor.execute(
        """
        INSERT OR IGNORE INTO sports (
            sport_name,
            status
        )
        VALUES (?, 'ACTIVE')
        """,
        (sport_name,)
    )


cursor.execute(
    """
    UPDATE sports
    SET status = 'ACTIVE'
    WHERE status IS NULL
    """
)


# 기존에 만들어둔 모임도
# 채팅방을 자동으로 만들어줌
cursor.execute(
    """
    INSERT OR IGNORE INTO chat_rooms (
        meeting_id
    )

    SELECT id
    FROM meetings
    """
)


# 기존 모임장은 자기 모임 채팅방에 자동 추가
cursor.execute(
    """
    INSERT OR IGNORE INTO chat_room_members (
        chat_room_id,
        user_id
    )

    SELECT
        cr.chat_room_id,
        m.host_id

    FROM chat_rooms AS cr

    JOIN meetings AS m
        ON cr.meeting_id = m.id
    """
)


# 이미 APPROVED 된 참가자도 채팅방에 추가
cursor.execute(
    """
    INSERT OR IGNORE INTO chat_room_members (
        chat_room_id,
        user_id
    )

    SELECT
        cr.chat_room_id,
        mp.user_id

    FROM meeting_participants AS mp

    JOIN chat_rooms AS cr
        ON mp.meeting_id = cr.meeting_id

    WHERE mp.participation_status = 'APPROVED'
    """
)


connection.commit()

connection.close()


print(
    "A, B, C, D DB 준비 완료"
)