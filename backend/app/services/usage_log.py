"""Kalıcı usage logging servisi — JSONL formatında append-only dosya.

Her API isteği kaydedilir: hangi key, model, token kullanımı, süre, başarı durumu.
Desktop dashboard uygulaması bu dosyayı okuyarak istatistikleri gösterir.
"""

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
LOG_FILE = DATA_DIR / "usage.jsonl"
MAX_LOG_SIZE_MB = 50  # 50MB'u aşınca eski satırları budar


def log_usage(
    key_index: int,
    model: str,
    prompt_tokens: int = 0,
    completion_tokens: int = 0,
    total_tokens: int = 0,
    success: bool = True,
    response_time_ms: int = 0,
    error: str = "",
    endpoint: str = "",
    language: str = "",
) -> None:
    """Tek bir API isteğini JSONL dosyasına append et."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    entry = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "key": key_index,
        "model": model,
        "pt": prompt_tokens,
        "ct": completion_tokens,
        "tt": total_tokens,
        "ok": success,
        "ms": response_time_ms,
    }
    if error:
        entry["err"] = error[:200]
    if endpoint:
        entry["ep"] = endpoint
    if language:
        entry["lang"] = language

    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception:
        pass  # log yazma hatası ana isteği engellemez

    _maybe_trim()


def _maybe_trim():
    """Dosya MAX_LOG_SIZE_MB'u aşarsa ilk %20'yi sil."""
    try:
        if LOG_FILE.stat().st_size > MAX_LOG_SIZE_MB * 1024 * 1024:
            lines = LOG_FILE.read_text(encoding="utf-8").splitlines()
            keep = lines[len(lines) // 5 :]
            LOG_FILE.write_text("\n".join(keep) + "\n", encoding="utf-8")
    except Exception:
        pass


def read_entries(since_iso: str | None = None) -> list[dict[str, Any]]:
    """Log dosyasını oku. since_iso verilirse sadece o tarihten sonrakileri döndür."""
    if not LOG_FILE.exists():
        return []

    cutoff = 0.0
    if since_iso:
        try:
            cutoff = datetime.fromisoformat(since_iso.replace("Z", "+00:00")).timestamp()
        except Exception:
            cutoff = 0.0

    entries = []
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    e = json.loads(line)
                    if cutoff > 0:
                        try:
                            ts = datetime.fromisoformat(e.get("ts", "").replace("Z", "+00:00")).timestamp()
                            if ts < cutoff:
                                continue
                        except Exception:
                            pass
                    entries.append(e)
                except json.JSONDecodeError:
                    continue
    except Exception:
        pass
    return entries


def get_usage_stats(since_iso: str | None = None) -> dict[str, Any]:
    """İstatistikleri hesapla ve dön."""
    entries = read_entries(since_iso)
    total = len(entries)
    if total == 0:
        return {
            "total_requests": 0,
            "total_tokens": 0,
            "total_prompt_tokens": 0,
            "total_completion_tokens": 0,
            "success_count": 0,
            "error_count": 0,
            "avg_response_ms": 0,
            "by_key": {},
            "by_model": {},
            "by_hour": {},
            "by_language": {},
            "by_day": {},
        }

    total_tt = sum(e.get("tt", 0) for e in entries)
    total_pt = sum(e.get("pt", 0) for e in entries)
    total_ct = sum(e.get("ct", 0) for e in entries)
    success_count = sum(1 for e in entries if e.get("ok", True))
    error_count = total - success_count
    avg_ms = sum(e.get("ms", 0) for e in entries) // total if total else 0

    # Key bazlı
    by_key: dict[str, dict[str, Any]] = {}
    for e in entries:
        k = f"key_{e.get('key', '?')}"
        if k not in by_key:
            by_key[k] = {"requests": 0, "tokens": 0, "errors": 0, "models": {}}
        by_key[k]["requests"] += 1
        by_key[k]["tokens"] += e.get("tt", 0)
        if not e.get("ok", True):
            by_key[k]["errors"] += 1
        m = e.get("model", "unknown")
        if m not in by_key[k]["models"]:
            by_key[k]["models"][m] = 0
        by_key[k]["models"][m] += 1

    # Model bazlı
    by_model: dict[str, dict[str, Any]] = {}
    for e in entries:
        m = e.get("model", "unknown")
        if m not in by_model:
            by_model[m] = {"requests": 0, "tokens": 0, "errors": 0}
        by_model[m]["requests"] += 1
        by_model[m]["tokens"] += e.get("tt", 0)
        if not e.get("ok", True):
            by_model[m]["errors"] += 1

    # Saatlik dağılım
    by_hour: dict[str, int] = {}
    for e in entries:
        try:
            h = datetime.fromisoformat(e.get("ts", "").replace("Z", "+00:00")).strftime("%Y-%m-%d %H:00")
        except Exception:
            h = "unknown"
        by_hour[h] = by_hour.get(h, 0) + 1

    # Dil bazlı
    by_language: dict[str, int] = {}
    for e in entries:
        lang = e.get("lang", "unknown")
        by_language[lang] = by_language.get(lang, 0) + 1

    # Günlük dağılım
    by_day: dict[str, dict[str, Any]] = {}
    for e in entries:
        try:
            d = datetime.fromisoformat(e.get("ts", "").replace("Z", "+00:00")).strftime("%Y-%m-%d")
        except Exception:
            d = "unknown"
        if d not in by_day:
            by_day[d] = {"requests": 0, "tokens": 0}
        by_day[d]["requests"] += 1
        by_day[d]["tokens"] += e.get("tt", 0)

    return {
        "total_requests": total,
        "total_tokens": total_tt,
        "total_prompt_tokens": total_pt,
        "total_completion_tokens": total_ct,
        "success_count": success_count,
        "error_count": error_count,
        "avg_response_ms": avg_ms,
        "by_key": by_key,
        "by_model": by_model,
        "by_hour": by_hour,
        "by_language": by_language,
        "by_day": by_day,
    }
