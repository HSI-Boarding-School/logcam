from app.database import SessionLocal
from app.models import Role



def get_roles():
    db = SessionLocal()
    try:
        roles = db.query(Role).all()
        return [
            {
                "id": str(r.id),
                "name": r.name
            } for r in roles
        ]
    finally:
        db.close()
