import base64
import shutil
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..config import settings
from ..services import gemini

router = APIRouter(prefix="/api", tags=["analyze"])

IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}
VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/webm", "video/x-msvideo", "video/3gpp"}
AUDIO_TYPES = {"audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/ogg"}


# --- JSON sohbet endpoint'leri (mobil uygulama) ---


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: Any  # str ya da OpenAI-uyumlu content array (text/image_url)


class ChatRequest(BaseModel):
    language: str = "de"
    modelId: str | None = None
    messages: list[ChatMessage]


@router.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    if not req.messages or not any(m.content for m in req.messages):
        raise HTTPException(status_code=422, detail="EMPTY")
    preferred = (req.modelId or "").strip() or gemini.DEFAULT_MODEL
    messages = [{"role": "system", "content": gemini.get_system_instruction(req.language)}]
    for m in req.messages:
        messages.append({"role": m.role, "content": m.content})

    async def event_source():
        full = ""
        try:
            async for text in gemini.chat_stream(messages, preferred):
                full = text
                yield f"data: {json_dumps({'text': text})}\n\n"
        except HTTPException as e:
            yield f"data: {json_dumps({'error': e.status_code, 'message': e.detail})}\n\n"
            return
        if not full:
            raise HTTPException(status_code=502, detail="EMPTY")
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_source(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/chat")
async def chat(req: ChatRequest):
    if not req.messages or not any(m.content for m in req.messages):
        raise HTTPException(status_code=422, detail="EMPTY")
    preferred = (req.modelId or "").strip() or gemini.DEFAULT_MODEL
    messages = [{"role": "system", "content": gemini.get_system_instruction(req.language)}]
    for m in req.messages:
        messages.append({"role": m.role, "content": m.content})
    analysis = await gemini.chat_json(messages, preferred)
    return {"ok": True, "analysis": analysis}


# --- Multipart endpoint (web demosu + tek-parca fallback) ---


@router.post("/analyze")
async def analyze(
    language: str = Form("de"),
    description: str = Form(""),
    modelId: str | None = Form(None),
    file: list[UploadFile] = File([]),
):
    if not file and not description.strip():
        raise HTTPException(status_code=422, detail="EMPTY")

    parts: list[dict[str, Any]] = []
    kind = "text"

    for f in file:
        mime = f.content_type or ""
        filename = f.filename or "upload"
        data = await f.read()
        if mime in IMAGE_TYPES:
            kind = "image"
            parts.append(
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{base64.b64encode(data).decode('ascii')}"},
                }
            )
        elif mime in VIDEO_TYPES:
            kind = "video"
            frame = _extract_video_frame(filename, data)
            if frame:
                parts.append(
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{frame}"},
                    }
                )
                parts.append({"type": "text", "text": f"[Video angehängt: {filename} – erstes Standbild]"})
            else:
                parts.append(
                    {
                        "type": "text",
                        "text": f"[Video angehängt: {filename} – konnte nicht analysiert werden. Beschreibe kurz, was im Video zu sehen ist.]",
                    }
                )
        elif mime in AUDIO_TYPES:
            kind = "audio"
            parts.append(
                {
                    "type": "text",
                    "text": f"[Datei angehängt: {filename} ({mime}) – kann nicht direkt analysiert werden. Nutze die textuelle Beschreibung.]",
                }
            )
        else:
            raise HTTPException(status_code=415, detail=f"Unsupported file type: {mime or 'unknown'}")

    if description.strip():
        parts.append({"type": "text", "text": f"Benutzer: {description.strip()}"})

    preferred = (modelId or "").strip() or gemini.DEFAULT_MODEL
    messages = [{"role": "user", "content": parts}]
    analysis = await gemini.chat_json(messages, preferred)

    return {
        "ok": True,
        "kind": kind,
        "language": language,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "analysis": analysis,
    }


def _extract_video_frame(filename: str, data: bytes) -> str | None:
    """ffmpeg varsa videodan ilk kareyi JPEG base64 olarak dondurur; yoksa None."""
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        return None
    suffix = Path(filename or "video").suffix or ".mp4"
    try:
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / f"in{suffix}"
            src.write_bytes(data)
            frame = Path(tmp) / "frame.jpg"
            subprocess.run(
                [ffmpeg, "-y", "-loglevel", "error", "-i", str(src), "-frames:v", "1", str(frame)],
                timeout=60,
                check=True,
                capture_output=True,
            )
            if frame.exists():
                return base64.b64encode(frame.read_bytes()).decode("ascii")
    except Exception:
        return None
    return None


def json_dumps(obj: Any) -> str:
    import json

    return json.dumps(obj, ensure_ascii=False)
