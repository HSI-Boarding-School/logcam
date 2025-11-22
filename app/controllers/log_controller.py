# app/controllers/log_controller.py  (update your file path accordingly)
from fastapi import WebSocket, WebSocketDisconnect, HTTPException
from app.database import SessionLocal
from app.models import Student, LogBook
from app.services.face_service import compare_faces
from app.utils.auth import decode_token_get_user
from app.utils.cache_utils import get_students_by_branch, seed_students_cache
from app.utils.redis_client import get_redis
from datetime import datetime, date
import cv2, base64, json, numpy as np
import asyncio

def b64_to_cv2_img(b64str: str):
    header, data = b64str.split(",", 1) if "," in b64str else (None, b64str)
    img_bytes = base64.b64decode(data)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)


async def process_log(websocket: WebSocket, tipe: str):

    auth_header = None
    for k, v in websocket.headers:
        if k.decode().lower() == "authorization":
            auth_header = v.decode()
            break
    if auth_header is None:
        auth_header = websocket.headers.get("authorization")

    if not auth_header:
        await websocket.close(code=1008)
        return

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        await websocket.close(code=1008)
        return

    token = parts[1]

    try:
        current_user = decode_token_get_user(token)
    except HTTPException as e:
        await websocket.close(code=1008)
        return

    branch_id = None if (current_user["role"] and current_user["role"].upper() == "ADMIN") else current_user["branch_id"]

    try:
        students = await get_students_by_branch(branch_id)
    except Exception:
        await seed_students_cache()
        students = await get_students_by_branch(branch_id)

    known_encodings = []
    known_students = []
    for s in students:
        emb = s.get("face_embedding")
        if emb:
            known_encodings.append(np.array(emb, dtype=np.float64))
            known_students.append(s)

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            frame_b64 = payload.get("frame")
            action = payload.get("action", "mengambil")

            frame = b64_to_cv2_img(frame_b64)
            small = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
            rgb_small = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)

            import face_recognition 
            face_encs = face_recognition.face_encodings(rgb_small)
            results_list = []

            for enc in face_encs:
                if len(known_encodings) == 0:
                    results_list.append({"name": "Unknown Face", "status": "NOT_FOUND"})
                    continue

                results, dists = compare_faces(known_encodings, enc)
                name, status = "Unknown Face", "NOT_FOUND"

                if True in results:
                    idx = int(np.argmin(dists))
                    student = known_students[idx]
                    name = student.get("name")

                    db = SessionLocal()
                    try:
                        today = date.today()
                        start_dt = datetime(today.year, today.month, today.day)
                        log = db.query(LogBook).filter(
                            LogBook.student_id == student.get("id"),
                            LogBook.tipe == tipe,
                            LogBook.created_at >= start_dt
                        ).first()

                        if not log:
                            log = LogBook(student_id=student.get("id"), tipe=tipe)
                            db.add(log)

                        changed = False
                        if action == "mengambil" and log.mengambil != "SUDAH":
                            log.mengambil = "SUDAH"
                            changed = True
                        elif action == "mengembalikan" and log.mengembalikan != "SUDAH":
                            log.mengembalikan = "SUDAH"
                            changed = True

                        if changed:
                            db.commit()
                        status = f"{action.upper()}_SUCCESS"

                    finally:
                        db.close()

                results_list.append({"name": name, "status": status})

            await websocket.send_json({"results": results_list})

    except WebSocketDisconnect:
        print("❌ Client disconnected")
    except Exception as e:
        print("Error in process_log:", e)
    finally:
        return
