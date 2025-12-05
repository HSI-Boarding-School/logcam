from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost",         
            "http://127.0.0.1",        
            "http://localhost:8080",    
            "http://127.0.0.1:8080",    
            "http://localhost:5173",  
            "http://localhost:3000"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
