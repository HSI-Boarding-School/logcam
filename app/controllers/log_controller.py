from fastapi import WebSocket, WebSocketDisconnect
from app.database import SessionLocal
from app.models import Student, LogBook
from app.services.face_service import compare_faces
from datetime import datetime, date
import cv2, base64, json, numpy as np


def b64_to_cv2_img(b64str: str):
    """Convert a base64 string into an OpenCV image."""
    header, data = b64str.split(",", 1) if "," in b64str else (None, b64str)
    img_bytes = base64.b64decode(data)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)


async def process_log(websocket: WebSocket, tipe: str):
    """Perform face detection and record log entries."""
    db = SessionLocal()
    students = db.query(Student).all()
    known_encodings = [np.array(s.face_embedding) for s in students if s.face_embedding]
    known_students = [s for s in students if s.face_embedding]

    try:
        while True:

            data = await websocket.receive_text()
            payload = json.loads(data)
            frame_b64 = payload.get("frame")
            action = payload.get("action", "mengambil")

            frame = b64_to_cv2_img(frame_b64)
            small = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
            rgb_small = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)

            # Lazy import of face_recognition at usage time
            import face_recognition  # type: ignore
            face_encs = face_recognition.face_encodings(rgb_small)
            results_list = []

            for enc in face_encs:
                results, dists = compare_faces(known_encodings, enc)
                name, status = "Unknown Face", "NOT_FOUND"

                if True in results:
                    idx = int(np.argmin(dists))
                    student = known_students[idx]
                    name = student.name

                    today = date.today()
                    start_dt = datetime(today.year, today.month, today.day)

                    log = db.query(LogBook).filter(
                        LogBook.student_id == student.id,
                        LogBook.tipe == tipe,
                        LogBook.created_at >= start_dt
                    ).first()

                    if not log:
                        log = LogBook(student_id=student.id, tipe=tipe)
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

                results_list.append({"name": name, "status": status})

            await websocket.send_json({"results": results_list})

    except WebSocketDisconnect:
        print("❌ Client disconnected")
    finally:
        db.close()