from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app, origins, allow_all):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=(origins if not allow_all else ["*"]),
        allow_credentials=(not allow_all),
        allow_methods=["*"],
        allow_headers=["*"],
    )
