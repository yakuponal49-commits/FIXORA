"""
FIXORA Analytics - n8n webhook bildirimleri.

Her olay ayrı async olarak n8n webhook'una gonderilir.
Hata olsa bile ana istegi engellemez.
"""

import asyncio
import os
import time
from datetime import datetime, timezone
from typing import Any

import httpx

# n8n webhook base URL
N8N_BASE = os.getenv("N8N_WEBHOOK_URL", "http://host.docker.internal:5678/webhook")

# Analytics event log (bellekte tutulur, gunluk rapor icin)
_event_log: list[dict] = []
_log_max = 1000  # max 1000 event tut


def _log_event(event_type: str, data: dict[str, Any]) -> None:
    """Event'i bellekte logla."""
    global _event_log
    entry = {
        "type": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        **data,
    }
    _event_log.append(entry)
    if len(_event_log) > _log_max:
        _event_log = _event_log[-_log_max:]


def get_daily_stats() -> dict[str, Any]:
    """Son 24 saatin istatistiklerini dondur."""
    now = datetime.now(timezone.utc)
    cutoff = now.timestamp() - 86400

    recent = [e for e in _event_log if _parse_ts(e.get("timestamp", "")) >= cutoff]

    analyses = [e for e in recent if e["type"] == "analysis"]
    errors = [e for e in recent if e["type"] == "error"]
    promo_uses = [e for e in recent if e["type"] == "promo_use"]

    # Kategori sayimi
    categories: dict[str, int] = {}
    for a in analyses:
        cat = a.get("category", "unknown")
        categories[cat] = categories.get(cat, 0) + 1

    # Dil sayimi
    languages: dict[str, int] = {}
    for a in analyses:
        lang = a.get("language", "unknown")
        languages[lang] = languages.get(lang, 0) + 1

    return {
        "total_analyses": len(analyses),
        "total_errors": len(errors),
        "total_promo_uses": len(promo_uses),
        "categories": categories,
        "languages": languages,
        "period": "last_24h",
    }


def _parse_ts(ts: str) -> float:
    """ISO timestamp'i float'a cevir."""
    try:
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        return dt.timestamp()
    except Exception:
        return 0.0


async def _send_webhook(path: str, data: dict[str, Any]) -> None:
    """n8n webhook'una POST at, hata olsa bile sessizce gec."""
    url = f"{N8N_BASE}/{path}"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(url, json=data)
    except Exception:
        pass  # n8n cokmediginde bile analiz devam etsin


def track_analysis(
    language: str,
    model_id: str = "",
    has_images: bool = False,
    category: str = "unknown",
    subcategory: str = "",
    description: str = "",
) -> None:
    """Yeni analiz olayini kaydet ve n8n'e bildir."""
    data = {
        "language": language,
        "model_id": model_id,
        "has_images": has_images,
        "category": category,
        "subcategory": subcategory,
        "description": description[:200] if description else "",
    }
    _log_event("analysis", data)
    asyncio.create_task(_send_webhook("fixora-event-analysis", data))


def track_promo_use(code: str, remaining: int, limit: int, note: str = "") -> None:
    """Promo kod kullanimini kaydet ve n8n'e bildir."""
    data = {
        "code": code,
        "remaining": remaining,
        "limit": limit,
        "note": note,
    }
    _log_event("promo_use", data)
    asyncio.create_task(_send_webhook("fixora-event-promo", data))


def track_error(endpoint: str, error_type: str, message: str, status_code: int = 500) -> None:
    """Hata olayini kaydet ve n8n'e bildir."""
    severity = "critical" if status_code >= 500 else "warning"
    data = {
        "endpoint": endpoint,
        "error_type": error_type,
        "message": message[:500],
        "status_code": status_code,
        "severity": severity,
    }
    _log_event("error", data)
    asyncio.create_task(_send_webhook("fixora-event-error", data))


def track_gemini_quota(key_index: int, model: str, remaining_seconds: float) -> None:
    """Gemini quota durumunu kaydet."""
    data = {
        "key_index": key_index,
        "model": model,
        "cooldown_remaining": int(remaining_seconds),
    }
    _log_event("gemini_quota", data)
