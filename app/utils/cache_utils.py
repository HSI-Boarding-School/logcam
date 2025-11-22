# app/utils/cache_utils.py
import json
from typing import List, Dict, Any
from app.database import SessionLocal
from app.models import Student
from app.utils.redis_client import get_redis
from sqlalchemy.orm import Session

# Redis key prefix
PREFIX = "students_by_branch"

def _student_to_dict(s: Student) -> Dict[str, Any]:
    return {
        "id": s.id,
        "name": s.name,
        "tipe_class": getattr(s, "tipe_class", None),
        "branch_id": s.branch_id,
        # ensure embedding is serializable (list of floats)
        "face_embedding": s.face_embedding if s.face_embedding else None,
    }

async def seed_students_cache():
    """Fetch all students from DB and write grouped data into redis."""
    redis = get_redis()
    db: Session = SessionLocal()
    try:
        students: List[Student] = db.query(Student).all()
        grouped: dict[int, list] = {}
        for s in students:
            bid = s.branch_id or 0
            grouped.setdefault(bid, []).append(_student_to_dict(s))

        # store each branch list as JSON
        # Also store a list of branch ids for easy ADMIN retrieval
        branch_ids = []
        for bid, arr in grouped.items():
            key = f"{PREFIX}:{bid}"
            await redis.set(key, json.dumps(arr))
            branch_ids.append(bid)

        await redis.set(f"{PREFIX}:branches", json.dumps(branch_ids))
        return True
    finally:
        db.close()

async def get_students_by_branch(branch_id: int | None):
    """Return list of student dicts for branch_id.
    If branch_id is None => return all students (combine branches).
    """
    redis = get_redis()
    if branch_id is None:
        # admin -> combine all stored branches
        branches_json = await redis.get(f"{PREFIX}:branches")
        if not branches_json:
            # cache miss
            await seed_students_cache()
            branches_json = await redis.get(f"{PREFIX}:branches") or "[]"
        branch_ids = json.loads(branches_json)
        all_students = []
        for bid in branch_ids:
            arr_json = await redis.get(f"{PREFIX}:{bid}")
            if arr_json:
                all_students.extend(json.loads(arr_json))
        return all_students

    # teacher -> specific branch
    arr_json = await redis.get(f"{PREFIX}:{branch_id}")
    if not arr_json:
        # cache miss -> refresh cache then try again
        await seed_students_cache()
        arr_json = await redis.get(f"{PREFIX}:{branch_id}") or "[]"
    return json.loads(arr_json)
