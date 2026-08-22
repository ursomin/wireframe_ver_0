from flask import (
    Flask,
    send_from_directory,
    request,
    abort,
    session
)

from flask_socketio import (
    SocketIO,
    join_room,
    leave_room,
    emit
)

import sqlite3
import re
import os

from datetime import datetime
from uuid import uuid4

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)


app = Flask(__name__)

app.secret_key = "playupp-dev-secret-key"

app.config["MAX_CONTENT_LENGTH"] = (
    5 * 1024 * 1024
)


# D - 실시간 통신
socketio = SocketIO(app)


PROFILE_UPLOAD_FOLDER = os.path.join(
    "uploads",
    "profile"
)

os.makedirs(
    PROFILE_UPLOAD_FOLDER,
    exist_ok=True
)


# DB 연결
def get_db_connection():

    connection = sqlite3.connect(
        "playupp.db"
    )

    connection.row_factory = (
        sqlite3.Row
    )

    connection.execute(
        "PRAGMA foreign_keys = ON"
    )

    return connection


# 채팅방 멤버인지 확인
def is_chat_member(
    cursor,
    chat_room_id,
    user_id
):

    cursor.execute(
        """
        SELECT 1
        FROM chat_room_members
        WHERE chat_room_id = ?
        AND user_id = ?
        """,
        (
            chat_room_id,
            user_id
        )
    )

    return (
        cursor.fetchone()
        is not None
    )


# 특정 모임의 채팅방에 사용자 추가
def add_user_to_meeting_chat(
    cursor,
    meeting_id,
    user_id
):

    cursor.execute(
        """
        SELECT chat_room_id
        FROM chat_rooms
        WHERE meeting_id = ?
        """,
        (meeting_id,)
    )

    room = cursor.fetchone()


    if room:

        cursor.execute(
            """
            INSERT OR IGNORE
            INTO chat_room_members (
                chat_room_id,
                user_id
            )
            VALUES (?, ?)
            """,
            (
                room["chat_room_id"],
                user_id
            )
        )


# 특정 모임 채팅방에서 사용자 제거
def remove_user_from_meeting_chat(
    cursor,
    meeting_id,
    user_id
):

    cursor.execute(
        """
        SELECT chat_room_id
        FROM chat_rooms
        WHERE meeting_id = ?
        """,
        (meeting_id,)
    )

    room = cursor.fetchone()


    if room:

        cursor.execute(
            """
            DELETE FROM chat_room_members
            WHERE chat_room_id = ?
            AND user_id = ?
            """,
            (
                room["chat_room_id"],
                user_id
            )
        )


# 회원가입
@app.post("/api/auth/signup")
def signup():

    if not request.is_json:

        return {
            "message":
                "Content-Type must be application/json"
        }, 415


    data = request.get_json()


    if not isinstance(data, dict):

        return {
            "message":
                "JSON body must be an object"
        }, 400


    login_id = data.get("login_id")
    password = data.get("password")
    nickname = data.get("nickname")
    email = data.get("email")
    birth_date = data.get("birth_date")
    gender = data.get("gender")
    region = data.get("region")


    if not login_id:

        return {
            "message": "need login_id"
        }, 400


    if not password:

        return {
            "message": "need password"
        }, 400


    if len(password) < 8:

        return {
            "message":
                "Password must be at least 8 characters"
        }, 400


    if not nickname:

        return {
            "message": "need nickname"
        }, 400


    if not email:

        return {
            "message": "need email"
        }, 400


    if not re.match(
        r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        email
    ):

        return {
            "message":
                "Invalid Email Format"
        }, 400


    if not birth_date:

        return {
            "message": "need birth_date"
        }, 400


    try:

        datetime.strptime(
            birth_date,
            "%Y-%m-%d"
        )

    except ValueError:

        return {
            "message":
                "birth_date must be YYYY-MM-DD"
        }, 400


    if gender not in (
        "MALE",
        "FEMALE"
    ):

        return {
            "message":
                "gender must be MALE or FEMALE"
        }, 400


    if not region:

        return {
            "message": "need region"
        }, 400


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT 1
        FROM users
        WHERE login_id = ?
        """,
        (login_id,)
    )


    if cursor.fetchone():

        connection.close()

        return {
            "message":
                "This ID is already registered."
        }, 409


    cursor.execute(
        """
        SELECT 1
        FROM users
        WHERE nickname = ?
        """,
        (nickname,)
    )


    if cursor.fetchone():

        connection.close()

        return {
            "message":
                "This nickname is already registered."
        }, 409


    cursor.execute(
        """
        SELECT 1
        FROM users
        WHERE email = ?
        """,
        (email,)
    )


    if cursor.fetchone():

        connection.close()

        return {
            "message":
                "This email is already registered."
        }, 409


    hashed_password = (
        generate_password_hash(
            password
        )
    )


    cursor.execute(
        """
        INSERT INTO users (
            login_id,
            password,
            nickname,
            email,
            birth_date,
            gender,
            region
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            login_id,
            hashed_password,
            nickname,
            email,
            birth_date,
            gender,
            region
        )
    )


    connection.commit()
    connection.close()


    return {
        "message":
            "registered successfully"
    }, 201


# 로그인
@app.post("/api/auth/login")
def login():

    if not request.is_json:

        return {
            "message":
                "Content-Type must be application/json"
        }, 415


    data = request.get_json()


    login_id = data.get(
        "login_id"
    )

    password = data.get(
        "password"
    )


    if not login_id or not password:

        return {
            "message":
                "need login_id and password"
        }, 400


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE login_id = ?
        """,
        (login_id,)
    )


    user = cursor.fetchone()

    connection.close()


    if not user:

        return {
            "message":
                "Invalid login id or password"
        }, 401


    if user["status"] == "DELETED":

        return {
            "message":
                "Invalid login id or password"
        }, 401


    if not check_password_hash(
        user["password"],
        password
    ):

        return {
            "message":
                "Invalid login id or password"
        }, 401


    session["user_id"] = (
        user["user_id"]
    )


    return {
        "message":
            "login successful"
    }, 200


# 로그아웃
@app.post("/api/auth/logout")
def logout():

    session.clear()

    return {
        "message":
            "Logout Successfully"
    }, 200


# 내 프로필
@app.get("/api/users/me")
def get_me():

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login Required"
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT
            login_id,
            nickname,
            email,
            profile_image,
            birth_date,
            gender,
            region
        FROM users
        WHERE user_id = ?
        AND status != 'DELETED'
        """,
        (user_id,)
    )


    user = cursor.fetchone()

    connection.close()


    if not user:

        return {
            "message":
                "User Not Found"
        }, 404


    return dict(user), 200


# 내 프로필 수정
@app.patch("/api/users/me")
def update_me():

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First"
        }, 401


    if not request.is_json:

        return {
            "message":
                "Content-Type must be application/json"
        }, 415


    data = request.get_json()


    nickname = data.get("nickname")
    email = data.get("email")
    birth_date = data.get("birth_date")
    gender = data.get("gender")
    region = data.get("region")


    if not all([
        nickname,
        email,
        birth_date,
        gender,
        region
    ]):

        return {
            "message":
                "All profile fields are required."
        }, 400


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT 1
        FROM users
        WHERE nickname = ?
        AND user_id != ?
        """,
        (
            nickname,
            user_id
        )
    )


    if cursor.fetchone():

        connection.close()

        return {
            "message":
                "This nickname is already registered."
        }, 409


    cursor.execute(
        """
        SELECT 1
        FROM users
        WHERE email = ?
        AND user_id != ?
        """,
        (
            email,
            user_id
        )
    )


    if cursor.fetchone():

        connection.close()

        return {
            "message":
                "This email is already registered."
        }, 409


    cursor.execute(
        """
        UPDATE users
        SET
            nickname = ?,
            email = ?,
            birth_date = ?,
            gender = ?,
            region = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        """,
        (
            nickname,
            email,
            birth_date,
            gender,
            region,
            user_id
        )
    )


    connection.commit()
    connection.close()


    return {
        "message":
            "Profile updated successfully."
    }, 200


# 비밀번호 변경
@app.patch("/api/users/me/password")
def update_password():

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First"
        }, 401


    data = request.get_json()


    current_password = data.get(
        "current_password"
    )

    new_password = data.get(
        "new_password"
    )


    if (
        not current_password
        or not new_password
    ):

        return {
            "message":
                "Invalid"
        }, 400


    if len(new_password) < 8:

        return {
            "message":
                "New password must be at least 8 characters."
        }, 400


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE user_id = ?
        """,
        (user_id,)
    )


    user = cursor.fetchone()


    if not user:

        connection.close()

        return {
            "message":
                "User Not Found"
        }, 404


    if not check_password_hash(
        user["password"],
        current_password
    ):

        connection.close()

        return {
            "message":
                "current password is not correct."
        }, 401


    new_hash = (
        generate_password_hash(
            new_password
        )
    )


    cursor.execute(
        """
        UPDATE users
        SET
            password = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        """,
        (
            new_hash,
            user_id
        )
    )


    connection.commit()
    connection.close()


    return {
        "message":
            "Password Updated Successfully."
    }, 200


# 프로필 이미지
@app.post("/api/users/me/profile-image")
def upload_profile_image():

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First."
        }, 401


    file = request.files.get(
        "profile_image"
    )


    if not file:

        return {
            "message":
                "Profile image is required."
        }, 400


    filename = file.filename


    if not filename or "." not in filename:

        return {
            "message":
                "이미지 파일을 선택해주세요."
        }, 400


    extension = (
        filename
        .rsplit(".", 1)[1]
        .lower()
    )


    if extension not in (
        "jpg",
        "jpeg",
        "png",
        "webp"
    ):

        return {
            "message":
                "jpg, jpeg, png, webp 이미지만 가능합니다."
        }, 400


    stored_filename = (
        f"{uuid4().hex}.{extension}"
    )


    save_path = os.path.join(
        PROFILE_UPLOAD_FOLDER,
        stored_filename
    )


    file.save(
        save_path
    )


    image_path = (
        f"/uploads/profile/"
        f"{stored_filename}"
    )


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        UPDATE users
        SET
            profile_image = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        """,
        (
            image_path,
            user_id
        )
    )


    connection.commit()
    connection.close()


    return {
        "message":
            "Profile image updated successfully.",

        "profile_image":
            image_path
    }, 200


@app.get("/uploads/profile/<filename>")
def get_profile_image(filename):

    return send_from_directory(
        PROFILE_UPLOAD_FOLDER,
        filename
    )


# 전체 운동 목록
@app.get("/api/sports")
def get_sports():

    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT
            sport_id,
            sport_name
        FROM sports
        WHERE status = 'ACTIVE'
        ORDER BY sport_id
        """
    )


    rows = cursor.fetchall()

    connection.close()


    return {
        "sports": [
            dict(row)
            for row in rows
        ]
    }, 200


# 내 운동
@app.get("/api/users/me/sports")
def get_my_sports():

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First."
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT
            s.sport_id,
            s.sport_name,
            us.skill_level
        FROM user_sports AS us

        JOIN sports AS s
            ON us.sport_id = s.sport_id

        WHERE us.user_id = ?

        ORDER BY s.sport_id
        """,
        (user_id,)
    )


    rows = cursor.fetchall()

    connection.close()


    return {
        "sports": [
            dict(row)
            for row in rows
        ]
    }, 200


# 운동 추가
@app.post("/api/users/me/sports")
def add_my_sport():

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First."
        }, 401


    data = request.get_json()

    sport_id = data.get(
        "sport_id"
    )

    skill_level = data.get(
        "skill_level"
    )


    if skill_level not in (
        "BRONZE",
        "SILVER",
        "GOLD",
        "MASTER"
    ):

        return {
            "message":
                "Invalid skill level."
        }, 400


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT sport_id
        FROM sports
        WHERE sport_id = ?
        AND status = 'ACTIVE'
        """,
        (sport_id,)
    )


    if not cursor.fetchone():

        connection.close()

        return {
            "message":
                "No Exist Sport."
        }, 404


    cursor.execute(
        """
        SELECT 1
        FROM user_sports
        WHERE user_id = ?
        AND sport_id = ?
        """,
        (
            user_id,
            sport_id
        )
    )


    if cursor.fetchone():

        connection.close()

        return {
            "message":
                "You already registered this sport."
        }, 409


    cursor.execute(
        """
        INSERT INTO user_sports (
            user_id,
            sport_id,
            skill_level
        )
        VALUES (?, ?, ?)
        """,
        (
            user_id,
            sport_id,
            skill_level
        )
    )


    connection.commit()
    connection.close()


    return {
        "message":
            "Sport registered successfully."
    }, 201


# 운동 실력 수정
@app.patch(
    "/api/users/me/sports/<int:sport_id>"
)
def update_my_sport(sport_id):

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First."
        }, 401


    data = request.get_json()

    skill_level = data.get(
        "skill_level"
    )


    if skill_level not in (
        "BRONZE",
        "SILVER",
        "GOLD",
        "MASTER"
    ):

        return {
            "message":
                "Invalid skill level."
        }, 400


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        UPDATE user_sports
        SET skill_level = ?
        WHERE user_id = ?
        AND sport_id = ?
        """,
        (
            skill_level,
            user_id,
            sport_id
        )
    )


    if cursor.rowcount == 0:

        connection.close()

        return {
            "message":
                "Register Sport First!"
        }, 404


    connection.commit()
    connection.close()


    return {
        "message":
            "Updated successfully."
    }, 200


# 운동 삭제
@app.delete(
    "/api/users/me/sports/<int:sport_id>"
)
def delete_my_sport(sport_id):

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First."
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        DELETE FROM user_sports
        WHERE user_id = ?
        AND sport_id = ?
        """,
        (
            user_id,
            sport_id
        )
    )


    if cursor.rowcount == 0:

        connection.close()

        return {
            "message":
                "No Exist Sport."
        }, 404


    connection.commit()
    connection.close()


    return {
        "message":
            "Deleted Successfully."
    }, 200


# 상대 프로필
@app.get("/api/users/<int:user_id>")
def get_user_profile(user_id):

    if not session.get(
        "user_id"
    ):

        return {
            "message":
                "Login First."
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT
            nickname,
            profile_image,
            region
        FROM users
        WHERE user_id = ?
        AND status != 'DELETED'
        """,
        (user_id,)
    )


    user = cursor.fetchone()


    if not user:

        connection.close()

        return {
            "message":
                "No user exists."
        }, 404


    cursor.execute(
        """
        SELECT
            s.sport_id,
            s.sport_name,
            us.skill_level

        FROM user_sports AS us

        JOIN sports AS s
            ON us.sport_id = s.sport_id

        WHERE us.user_id = ?
        """,
        (user_id,)
    )


    sports = cursor.fetchall()

    connection.close()


    result = dict(user)

    result["sports"] = [
        dict(row)
        for row in sports
    ]


    return result, 200


# 계정 삭제
@app.delete("/api/users/me")
def delete_me():

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First"
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        UPDATE users
        SET
            login_id = ?,
            nickname = ?,
            email = ?,
            status = 'DELETED',
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        """,
        (
            f"deleted_user_{user_id}",
            f"deleted_user_{user_id}",
            f"deleted_user_{user_id}@deleted.local",
            user_id
        )
    )


    connection.commit()
    connection.close()

    session.clear()


    return {
        "message":
            "deleted successfully"
    }, 200


# B - 모임 목록 / 검색 / 필터
@app.get("/api/meetings")
def get_meetings():

    keyword = request.args.get(
        "keyword"
    )

    sport_id = request.args.get(
        "sport_id",
        type=int
    )

    meeting_date = request.args.get(
        "date"
    )

    meeting_location = request.args.get(
        "location"
    )

    status = request.args.get(
        "status"
    )


    conditions = []
    params = []


    if keyword:

        conditions.append(
            """
            (
                m.title LIKE ?
                OR m.description LIKE ?
            )
            """
        )

        params.extend([
            f"%{keyword}%",
            f"%{keyword}%"
        ])


    if sport_id is not None:

        conditions.append(
            "m.sport_id = ?"
        )

        params.append(
            sport_id
        )


    if meeting_date:

        try:

            datetime.strptime(
                meeting_date,
                "%Y-%m-%d"
            )

        except ValueError:

            return {
                "message":
                    "날짜는 YYYY-MM-DD 형식이어야 합니다."
            }, 400


        conditions.append(
            "m.meeting_date = ?"
        )

        params.append(
            meeting_date
        )


    if meeting_location:

        conditions.append(
            "m.location LIKE ?"
        )

        params.append(
            f"%{meeting_location}%"
        )


    allowed_statuses = {
        "RECRUITING",
        "CLOSED",
        "COMPLETED",
        "CANCELED"
    }


    if status:

        if status not in allowed_statuses:

            return {
                "message":
                    "올바르지 않은 모집 상태입니다."
            }, 400


        conditions.append(
            "m.status = ?"
        )

        params.append(
            status
        )


    where_sql = ""


    if conditions:

        where_sql = (
            "WHERE "
            + " AND ".join(
                conditions
            )
        )


    sql = f"""
        SELECT
            m.id,
            m.title,
            m.description,
            m.sport_id,
            s.sport_name,
            m.host_id,
            u.nickname AS host_name,
            m.meeting_date,
            m.location,
            m.max_members,
            m.status

        FROM meetings AS m

        JOIN sports AS s
            ON m.sport_id = s.sport_id

        JOIN users AS u
            ON m.host_id = u.user_id

        {where_sql}

        ORDER BY m.meeting_date ASC
    """


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        sql,
        params
    )


    rows = cursor.fetchall()

    connection.close()


    meetings = [
        dict(row)
        for row in rows
    ]


    return {
        "meetings":
            meetings,

        "total":
            len(meetings)
    }, 200


# 내가 만든 모임
@app.get("/api/users/me/meetings")
def get_my_meetings():

    user_id = session.get(
        "user_id"
    )


    if user_id is None:

        return {
            "message":
                "로그인이 필요합니다."
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT
            m.id,
            m.title,
            s.sport_name,
            m.meeting_date,
            m.location,
            m.status

        FROM meetings AS m

        JOIN sports AS s
            ON m.sport_id = s.sport_id

        WHERE m.host_id = ?

        ORDER BY m.meeting_date ASC
        """,
        (user_id,)
    )


    rows = cursor.fetchall()

    connection.close()


    meetings = [
        dict(row)
        for row in rows
    ]


    return {
        "meetings":
            meetings,

        "total":
            len(meetings)
    }, 200


# 모임 상세
@app.get(
    "/api/meetings/<int:meeting_id>"
)
def get_meeting(meeting_id):

    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT
            m.id,
            m.title,
            m.description,
            m.sport_id,
            s.sport_name,
            m.host_id,
            u.nickname AS host_name,
            m.meeting_date,
            m.location,
            m.max_members,
            m.approval_type,
            m.status

        FROM meetings AS m

        JOIN sports AS s
            ON m.sport_id = s.sport_id

        JOIN users AS u
            ON m.host_id = u.user_id

        WHERE m.id = ?
        """,
        (meeting_id,)
    )


    meeting = cursor.fetchone()

    connection.close()


    if not meeting:

        return {
            "message":
                "모임을 찾을 수 없습니다."
        }, 404


    return dict(meeting), 200


# 모임 생성
@app.post("/api/meetings")
def create_meeting():

    user_id = session.get(
        "user_id"
    )


    if user_id is None:

        return {
            "message":
                "로그인이 필요합니다."
        }, 401


    if not request.is_json:

        return {
            "message":
                "JSON 요청이 필요합니다."
        }, 415


    data = request.get_json()


    required_fields = [
        "title",
        "description",
        "sport_id",
        "meeting_date",
        "location",
        "max_members"
    ]


    for field in required_fields:

        if data.get(field) in (
            None,
            ""
        ):

            return {
                "message":
                    f"{field} 값이 필요합니다."
            }, 400


    try:

        datetime.strptime(
            data["meeting_date"],
            "%Y-%m-%d"
        )

    except ValueError:

        return {
            "message":
                "날짜는 YYYY-MM-DD 형식이어야 합니다."
        }, 400


    try:

        max_members = int(
            data["max_members"]
        )

    except (
        ValueError,
        TypeError
    ):

        return {
            "message":
                "모집 인원은 숫자여야 합니다."
        }, 400


    if max_members < 1:

        return {
            "message":
                "모집 인원은 1명 이상이어야 합니다."
        }, 400


    connection = get_db_connection()
    cursor = connection.cursor()


    try:

        # 모임 생성
        cursor.execute(
            """
            INSERT INTO meetings (
                host_id,
                sport_id,
                title,
                description,
                meeting_date,
                location,
                max_members,
                approval_type,
                status
            )
            VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                'HOST_APPROVAL',
                'RECRUITING'
            )
            """,
            (
                user_id,
                data["sport_id"],
                data["title"],
                data["description"],
                data["meeting_date"],
                data["location"],
                max_members
            )
        )


        meeting_id = (
            cursor.lastrowid
        )


        # D - 모임 생성과 동시에 채팅방 생성
        cursor.execute(
            """
            INSERT INTO chat_rooms (
                meeting_id
            )
            VALUES (?)
            """,
            (meeting_id,)
        )


        chat_room_id = (
            cursor.lastrowid
        )


        # D - 모임장은 채팅방 멤버
        cursor.execute(
            """
            INSERT INTO chat_room_members (
                chat_room_id,
                user_id
            )
            VALUES (?, ?)
            """,
            (
                chat_room_id,
                user_id
            )
        )


        connection.commit()


    except Exception:

        connection.rollback()

        return {
            "message":
                "모임 생성 중 오류가 발생했습니다."
        }, 500


    finally:

        connection.close()


    return {
        "message":
            "모임이 생성되었습니다.",

        "meeting_id":
            meeting_id
    }, 201


# 모임 수정
@app.put(
    "/api/meetings/<int:meeting_id>"
)
def update_meeting(meeting_id):

    user_id = session.get(
        "user_id"
    )


    if user_id is None:

        return {
            "message":
                "로그인이 필요합니다."
        }, 401


    data = request.get_json()


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT
            user_id,
            role
        FROM users
        WHERE user_id = ?
        """,
        (user_id,)
    )


    user = cursor.fetchone()


    cursor.execute(
        """
        SELECT
            id,
            host_id
        FROM meetings
        WHERE id = ?
        """,
        (meeting_id,)
    )


    meeting = cursor.fetchone()


    if not meeting:

        connection.close()

        return {
            "message":
                "모임을 찾을 수 없습니다."
        }, 404


    is_host = (
        meeting["host_id"]
        == user_id
    )

    is_admin = (
        user
        and user["role"] == "ADMIN"
    )


    if (
        not is_host
        and not is_admin
    ):

        connection.close()

        return {
            "message":
                "수정 권한이 없습니다."
        }, 403


    cursor.execute(
        """
        UPDATE meetings
        SET
            title = ?,
            description = ?,
            sport_id = ?,
            meeting_date = ?,
            location = ?,
            max_members = ?,
            status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            data["title"],
            data["description"],
            data["sport_id"],
            data["meeting_date"],
            data["location"],
            data["max_members"],
            data["status"],
            meeting_id
        )
    )


    connection.commit()
    connection.close()


    return {
        "message":
            "모임이 수정되었습니다."
    }, 200


# 모임 삭제
@app.delete(
    "/api/meetings/<int:meeting_id>"
)
def delete_meeting(meeting_id):

    user_id = session.get(
        "user_id"
    )


    if user_id is None:

        return {
            "message":
                "로그인이 필요합니다."
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    try:

        cursor.execute(
            """
            SELECT
                user_id,
                role
            FROM users
            WHERE user_id = ?
            """,
            (user_id,)
        )

        user = cursor.fetchone()


        cursor.execute(
            """
            SELECT
                id,
                host_id
            FROM meetings
            WHERE id = ?
            """,
            (meeting_id,)
        )

        meeting = cursor.fetchone()


        if not meeting:

            return {
                "message":
                    "모임을 찾을 수 없습니다."
            }, 404


        if (
            meeting["host_id"] != user_id
            and (
                not user
                or user["role"] != "ADMIN"
            )
        ):

            return {
                "message":
                    "삭제 권한이 없습니다."
            }, 403


        # 해당 모임 채팅방 찾기
        cursor.execute(
            """
            SELECT chat_room_id
            FROM chat_rooms
            WHERE meeting_id = ?
            """,
            (meeting_id,)
        )


        room = cursor.fetchone()


        if room:

            chat_room_id = (
                room["chat_room_id"]
            )


            cursor.execute(
                """
                DELETE FROM chat_messages
                WHERE chat_room_id = ?
                """,
                (chat_room_id,)
            )


            cursor.execute(
                """
                DELETE FROM chat_room_members
                WHERE chat_room_id = ?
                """,
                (chat_room_id,)
            )


            cursor.execute(
                """
                DELETE FROM chat_rooms
                WHERE chat_room_id = ?
                """,
                (chat_room_id,)
            )


        cursor.execute(
            """
            DELETE FROM meeting_participants
            WHERE meeting_id = ?
            """,
            (meeting_id,)
        )


        cursor.execute(
            """
            DELETE FROM meeting_members
            WHERE meeting_id = ?
            """,
            (meeting_id,)
        )


        cursor.execute(
            """
            DELETE FROM meetings
            WHERE id = ?
            """,
            (meeting_id,)
        )


        connection.commit()


    except Exception:

        connection.rollback()

        return {
            "message":
                "삭제 중 오류가 발생했습니다."
        }, 500


    finally:

        connection.close()


    return "", 204


# C - 참여 신청
@app.post(
    "/api/meetings/<int:meeting_id>/participants"
)
def join_meeting(meeting_id):

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First"
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM meetings
        WHERE id = ?
        """,
        (meeting_id,)
    )


    meeting = cursor.fetchone()


    if not meeting:

        connection.close()

        return {
            "message":
                "Meeting Not Found"
        }, 404


    cursor.execute(
        """
        SELECT *
        FROM meeting_participants
        WHERE meeting_id = ?
        AND user_id = ?
        """,
        (
            meeting_id,
            user_id
        )
    )


    if cursor.fetchone():

        connection.close()

        return {
            "message":
                "Already Participated"
        }, 409


    cursor.execute(
        """
        SELECT COUNT(*) AS count
        FROM meeting_participants
        WHERE meeting_id = ?
        AND participation_status = 'APPROVED'
        """,
        (meeting_id,)
    )


    count = (
        cursor.fetchone()["count"]
    )


    if (
        count
        >= meeting["max_members"]
    ):

        connection.close()

        return {
            "message":
                "Meeting Full"
        }, 409


    if (
        meeting["approval_type"]
        == "INSTANT"
    ):

        participation_status = (
            "APPROVED"
        )

    else:

        participation_status = (
            "PENDING"
        )


    cursor.execute(
        """
        INSERT INTO meeting_participants (
            meeting_id,
            user_id,
            participation_status
        )
        VALUES (?, ?, ?)
        """,
        (
            meeting_id,
            user_id,
            participation_status
        )
    )


    # 즉시 승인형이면 바로 채팅방 추가
    if (
        participation_status
        == "APPROVED"
    ):

        add_user_to_meeting_chat(
            cursor,
            meeting_id,
            user_id
        )


    connection.commit()
    connection.close()


    return {
        "message":
            "Participation Successful"
    }, 201


# C - 참여 취소
@app.delete(
    "/api/meetings/<int:meeting_id>/participants/me"
)
def cancel_participation(meeting_id):

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First"
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM meeting_participants
        WHERE meeting_id = ?
        AND user_id = ?
        """,
        (
            meeting_id,
            user_id
        )
    )


    if not cursor.fetchone():

        connection.close()

        return {
            "message":
                "Participation Not Found"
        }, 404


    cursor.execute(
        """
        UPDATE meeting_participants
        SET
            participation_status = 'CANCELED',
            canceled_at = CURRENT_TIMESTAMP
        WHERE meeting_id = ?
        AND user_id = ?
        """,
        (
            meeting_id,
            user_id
        )
    )


    # 참여 취소하면 채팅방에서도 제거
    remove_user_from_meeting_chat(
        cursor,
        meeting_id,
        user_id
    )


    connection.commit()
    connection.close()


    return {
        "message":
            "Participation Canceled"
    }, 200


# C - 승인 대기자 조회
@app.get(
    "/api/meetings/<int:meeting_id>/participants"
)
def get_participants(meeting_id):

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First"
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM meetings
        WHERE id = ?
        """,
        (meeting_id,)
    )


    meeting = cursor.fetchone()


    if not meeting:

        connection.close()

        return {
            "message":
                "Meeting Not Found"
        }, 404


    if (
        meeting["host_id"]
        != user_id
    ):

        connection.close()

        return {
            "message":
                "Not Authorized"
        }, 403


    cursor.execute(
        """
        SELECT *
        FROM meeting_participants
        WHERE meeting_id = ?
        AND participation_status = 'PENDING'
        """,
        (meeting_id,)
    )


    participants = cursor.fetchall()

    connection.close()


    return [
        dict(row)
        for row in participants
    ], 200


# C - 승인
@app.post(
    "/api/meetings/<int:meeting_id>/participants/<int:target_user_id>/approve"
)
def approve_participation(
    meeting_id,
    target_user_id
):

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First"
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM meetings
        WHERE id = ?
        """,
        (meeting_id,)
    )


    meeting = cursor.fetchone()


    if not meeting:

        connection.close()

        return {
            "message":
                "Meeting Not Found"
        }, 404


    if (
        meeting["host_id"]
        != user_id
    ):

        connection.close()

        return {
            "message":
                "Not Authorized"
        }, 403


    cursor.execute(
        """
        SELECT *
        FROM meeting_participants
        WHERE meeting_id = ?
        AND user_id = ?
        AND participation_status = 'PENDING'
        """,
        (
            meeting_id,
            target_user_id
        )
    )


    if not cursor.fetchone():

        connection.close()

        return {
            "message":
                "Participation Request Not Found"
        }, 404


    cursor.execute(
        """
        UPDATE meeting_participants
        SET
            participation_status = 'APPROVED',
            approved_at = CURRENT_TIMESTAMP
        WHERE meeting_id = ?
        AND user_id = ?
        """,
        (
            meeting_id,
            target_user_id
        )
    )


    # 승인되면 D 채팅방 멤버로 추가
    add_user_to_meeting_chat(
        cursor,
        meeting_id,
        target_user_id
    )


    connection.commit()
    connection.close()


    return {
        "message":
            "Participation Approved"
    }, 200


# C - 거절
@app.post(
    "/api/meetings/<int:meeting_id>/participants/<int:target_user_id>/reject"
)
def reject_participation(
    meeting_id,
    target_user_id
):

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First"
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM meetings
        WHERE id = ?
        """,
        (meeting_id,)
    )


    meeting = cursor.fetchone()


    if not meeting:

        connection.close()

        return {
            "message":
                "Meeting Not Found"
        }, 404


    if (
        meeting["host_id"]
        != user_id
    ):

        connection.close()

        return {
            "message":
                "Not Authorized"
        }, 403


    cursor.execute(
        """
        UPDATE meeting_participants
        SET participation_status = 'REJECTED'
        WHERE meeting_id = ?
        AND user_id = ?
        AND participation_status = 'PENDING'
        """,
        (
            meeting_id,
            target_user_id
        )
    )


    if cursor.rowcount == 0:

        connection.close()

        return {
            "message":
                "Participation Request Not Found"
        }, 404


    connection.commit()
    connection.close()


    return {
        "message":
            "Participation Rejected"
    }, 200


# C - 승인 참여자
@app.get(
    "/api/meetings/<int:meeting_id>/participants/approved"
)
def get_approved_participants(
    meeting_id
):

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First"
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM meetings
        WHERE id = ?
        """,
        (meeting_id,)
    )


    if not cursor.fetchone():

        connection.close()

        return {
            "message":
                "Meeting Not Found"
        }, 404


    cursor.execute(
        """
        SELECT *
        FROM meeting_participants
        WHERE meeting_id = ?
        AND participation_status = 'APPROVED'
        """,
        (meeting_id,)
    )


    rows = cursor.fetchall()

    connection.close()


    return [
        dict(row)
        for row in rows
    ], 200


# C - 강퇴
@app.delete(
    "/api/meetings/<int:meeting_id>/participants/<int:target_user_id>"
)
def kick_participant(
    meeting_id,
    target_user_id
):

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First"
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM meetings
        WHERE id = ?
        """,
        (meeting_id,)
    )


    meeting = cursor.fetchone()


    if not meeting:

        connection.close()

        return {
            "message":
                "Meeting Not Found"
        }, 404


    if (
        meeting["host_id"]
        != user_id
    ):

        connection.close()

        return {
            "message":
                "Not Authorized"
        }, 403


    cursor.execute(
        """
        UPDATE meeting_participants
        SET participation_status = 'KICKED'
        WHERE meeting_id = ?
        AND user_id = ?
        AND participation_status = 'APPROVED'
        """,
        (
            meeting_id,
            target_user_id
        )
    )


    if cursor.rowcount == 0:

        connection.close()

        return {
            "message":
                "Participant Not Found"
        }, 404


    # 강퇴되면 채팅방에서도 제거
    remove_user_from_meeting_chat(
        cursor,
        meeting_id,
        target_user_id
    )


    connection.commit()
    connection.close()


    return {
        "message":
            "Participant Kicked"
    }, 200


# C - 출석
@app.post(
    "/api/meetings/<int:meeting_id>/participants/<int:target_user_id>/attendance"
)
def update_attendance(
    meeting_id,
    target_user_id
):

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First"
        }, 401


    data = request.get_json()

    attendance_status = data.get(
        "attendance_status"
    )


    if attendance_status not in (
        "ATTENDED",
        "NO_SHOW"
    ):

        return {
            "message":
                "Invalid Attendance Status"
        }, 400


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT *
        FROM meetings
        WHERE id = ?
        """,
        (meeting_id,)
    )


    meeting = cursor.fetchone()


    if not meeting:

        connection.close()

        return {
            "message":
                "Meeting Not Found"
        }, 404


    if (
        meeting["host_id"]
        != user_id
    ):

        connection.close()

        return {
            "message":
                "Not Authorized"
        }, 403


    cursor.execute(
        """
        UPDATE meeting_participants
        SET attendance_status = ?
        WHERE meeting_id = ?
        AND user_id = ?
        AND participation_status = 'APPROVED'
        """,
        (
            attendance_status,
            meeting_id,
            target_user_id
        )
    )


    if cursor.rowcount == 0:

        connection.close()

        return {
            "message":
                "Participant Not Found"
        }, 404


    connection.commit()
    connection.close()


    return {
        "message":
            "Attendance Updated"
    }, 200


# D - 내 채팅방 목록
@app.get("/api/chat/rooms")
def get_chat_rooms():

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First"
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    cursor.execute(
        """
        SELECT
            cr.chat_room_id,
            cr.meeting_id,
            m.title,
            s.sport_name

        FROM chat_room_members AS crm

        JOIN chat_rooms AS cr
            ON crm.chat_room_id
            = cr.chat_room_id

        JOIN meetings AS m
            ON cr.meeting_id
            = m.id

        JOIN sports AS s
            ON m.sport_id
            = s.sport_id

        WHERE crm.user_id = ?

        ORDER BY cr.chat_room_id DESC
        """,
        (user_id,)
    )


    rooms = cursor.fetchall()

    connection.close()


    return [
        dict(room)
        for room in rooms
    ], 200


# D - 과거 메시지 조회
@app.get(
    "/api/chat/rooms/<int:chat_room_id>/messages"
)
def get_chat_messages(
    chat_room_id
):

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First"
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    if not is_chat_member(
        cursor,
        chat_room_id,
        user_id
    ):

        connection.close()

        return {
            "message":
                "Not Chat Room Member"
        }, 403


    cursor.execute(
        """
        SELECT
            cm.message_id,
            cm.sender_id,
            u.nickname,
            u.profile_image,
            cm.content,
            cm.created_at

        FROM chat_messages AS cm

        JOIN users AS u
            ON cm.sender_id
            = u.user_id

        WHERE cm.chat_room_id = ?

        ORDER BY cm.message_id ASC
        """,
        (chat_room_id,)
    )


    rows = cursor.fetchall()

    connection.close()


    return [
        dict(row)
        for row in rows
    ], 200


# D - 채팅방 멤버 조회
@app.get(
    "/api/chat/rooms/<int:chat_room_id>/members"
)
def get_chat_members(
    chat_room_id
):

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return {
            "message":
                "Login First"
        }, 401


    connection = get_db_connection()
    cursor = connection.cursor()


    if not is_chat_member(
        cursor,
        chat_room_id,
        user_id
    ):

        connection.close()

        return {
            "message":
                "Not Chat Room Member"
        }, 403


    cursor.execute(
        """
        SELECT
            u.user_id,
            u.nickname,
            u.profile_image

        FROM chat_room_members AS crm

        JOIN users AS u
            ON crm.user_id
            = u.user_id

        WHERE crm.chat_room_id = ?

        ORDER BY u.nickname
        """,
        (chat_room_id,)
    )


    rows = cursor.fetchall()

    connection.close()


    return [
        dict(row)
        for row in rows
    ], 200


# D - Socket.IO 연결
@socketio.on("connect")
def handle_connect():

    user_id = session.get(
        "user_id"
    )


    # 로그인 안 했으면 Socket.IO 연결 거부
    if not user_id:

        return False


    print(
        f"Socket connected: user {user_id}"
    )


# D - 채팅방 입장
@socketio.on("join_room")
def handle_join_room(data):

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        emit(
            "chat_error",
            {
                "message":
                    "Login First"
            }
        )

        return


    try:

        chat_room_id = int(
            data.get(
                "chat_room_id"
            )
        )

    except (
        TypeError,
        ValueError
    ):

        emit(
            "chat_error",
            {
                "message":
                    "Invalid chat room"
            }
        )

        return


    connection = get_db_connection()
    cursor = connection.cursor()


    if not is_chat_member(
        cursor,
        chat_room_id,
        user_id
    ):

        connection.close()

        emit(
            "chat_error",
            {
                "message":
                    "Not Chat Room Member"
            }
        )

        return


    connection.close()


    # DB 채팅방 번호와
    # Socket.IO room 번호를 동일하게 사용
    join_room(
        str(chat_room_id)
    )


    emit(
        "joined_room",
        {
            "chat_room_id":
                chat_room_id
        }
    )


# D - 메시지 전송
@socketio.on("send_message")
def handle_send_message(data):

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        emit(
            "chat_error",
            {
                "message":
                    "Login First"
            }
        )

        return


    try:

        chat_room_id = int(
            data.get(
                "chat_room_id"
            )
        )

    except (
        TypeError,
        ValueError
    ):

        emit(
            "chat_error",
            {
                "message":
                    "Invalid chat room"
            }
        )

        return


    content = str(
        data.get(
            "content",
            ""
        )
    ).strip()


    if not content:

        emit(
            "chat_error",
            {
                "message":
                    "메시지를 입력해주세요."
            }
        )

        return


    connection = get_db_connection()
    cursor = connection.cursor()


    # 승인된 채팅방 멤버인지 다시 검사
    if not is_chat_member(
        cursor,
        chat_room_id,
        user_id
    ):

        connection.close()

        emit(
            "chat_error",
            {
                "message":
                    "Not Chat Room Member"
            }
        )

        return


    # 먼저 DB 저장
    cursor.execute(
        """
        INSERT INTO chat_messages (
            chat_room_id,
            sender_id,
            content
        )
        VALUES (?, ?, ?)
        """,
        (
            chat_room_id,
            user_id,
            content
        )
    )


    message_id = (
        cursor.lastrowid
    )


    connection.commit()


    # 저장된 메시지를 사용자 정보와 함께 조회
    cursor.execute(
        """
        SELECT
            cm.message_id,
            cm.chat_room_id,
            cm.sender_id,
            u.nickname,
            u.profile_image,
            cm.content,
            cm.created_at

        FROM chat_messages AS cm

        JOIN users AS u
            ON cm.sender_id
            = u.user_id

        WHERE cm.message_id = ?
        """,
        (message_id,)
    )


    message = cursor.fetchone()

    connection.close()


    # DB 저장 성공 후 emit
    emit(
        "receive_message",
        dict(message),
        to=str(chat_room_id)
    )


# D - 채팅방 퇴장
@socketio.on("leave_room")
def handle_leave_room(data):

    try:

        chat_room_id = int(
            data.get(
                "chat_room_id"
            )
        )

    except (
        TypeError,
        ValueError
    ):

        return


    leave_room(
        str(chat_room_id)
    )


    emit(
        "left_room",
        {
            "chat_room_id":
                chat_room_id
        }
    )


# D - Socket.IO 연결 종료
@socketio.on("disconnect")
def handle_disconnect(
    reason=None
):

    user_id = session.get(
        "user_id"
    )


    print(
        f"Socket disconnected: "
        f"user {user_id}"
    )


# 메인
@app.route("/")
def home():

    return send_from_directory(
        ".",
        "index.html"
    )


# 정적 파일
@app.route("/<path:filename>")
def static_files(filename):

    allowed_extensions = (
        ".html",
        ".css",
        ".js",
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".svg",
        ".webp",
        ".ico"
    )


    if not filename.lower().endswith(
        allowed_extensions
    ):

        abort(404)


    return send_from_directory(
        ".",
        filename
    )
@socketio.on("leave_room")
def handle_leave_room(data):

    user_id = session.get(
        "user_id"
    )

    if not user_id:

        emit(
            "chat_error",
            {
                "message":
                    "Login First"
            }
        )

        return


    try:

        chat_room_id = int(
            data.get(
                "chat_room_id"
            )
        )

    except (
        TypeError,
        ValueError
    ):

        emit(
            "chat_error",
            {
                "message":
                    "Invalid chat room"
            }
        )

        return


    # Socket.IO의 해당 room에서만 퇴장
    leave_room(
        str(chat_room_id)
    )


    print(
        f"user {user_id} "
        f"left chat room "
        f"{chat_room_id}"
    )


    # 클라이언트에게 퇴장 완료 알림
    emit(
        "left_room",
        {
            "chat_room_id":
                chat_room_id
        }
    )


if __name__ == "__main__":

    # D가 들어왔으므로
    # app.run()이 아니라 socketio.run()
    socketio.run(
        app,
        debug=True
    )