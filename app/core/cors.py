from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost",          # ✅ frontend via nginx (port 80)
            "http://127.0.0.1",          # ✅ jaga-jaga
            "http://localhost:8080",     # ✅ frontend docker
            "http://127.0.0.1:8080",     # ✅ jaga-jaga
            "http://localhost:5173",     # ✅ kalau pakai vite juga
            "http://localhost:3000"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
