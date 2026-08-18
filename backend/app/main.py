from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os

from .routers import analyze, materials, promo
from .services.analytics import get_daily_stats, track_error

app = FastAPI(
    title="FIXORA API",
    description="Home repair analysis powered by Google Gemini.",
    version="0.1.0",
)

# CORS: production'da sadece uygulama domain'ine izin ver
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(promo.router)
app.include_router(materials.router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/analytics/daily")
async def analytics_daily():
    """Son 24 saatin istatistiklerini dondurur."""
    return get_daily_stats()


@app.post("/api/debug/raw")
async def debug_raw(request: Request):
    """GECICI DEBUG: uygulamadan ham history verisini topla."""
    import urllib.parse

    try:
        body = await request.body()
        decoded = urllib.parse.unquote(body.decode("utf-8", errors="replace"))
        debug_path = os.getenv("DEBUG_LOG_PATH", "/tmp/history_raw_debug.txt")
        with open(debug_path, "a", encoding="utf-8") as f:
            f.write(repr(decoded) + "\n=====\n")
    except Exception:
        pass
    return {"ok": True}
