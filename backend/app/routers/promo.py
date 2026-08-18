import json
import os
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services.analytics import track_promo_use

router = APIRouter(prefix="/api", tags=["promo"])

# Promo code dosyası (JSON)
PROMO_FILE = os.path.join(os.path.dirname(__file__), "../data/promo_codes.json")
os.makedirs(os.path.dirname(PROMO_FILE), exist_ok=True)


def _load_promos() -> dict:
    """Promo kodlarını dosyadan yükle."""
    if os.path.exists(PROMO_FILE):
        try:
            with open(PROMO_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def _save_promos(promos: dict) -> None:
    """Promo kodlarını dosyaya kaydet."""
    os.makedirs(os.path.dirname(PROMO_FILE), exist_ok=True)
    with open(PROMO_FILE, "w", encoding="utf-8") as f:
        json.dump(promos, f, indent=2, ensure_ascii=False)


def _generate_code(length: int = 10) -> str:
    """Rastgele promo kod oluştur: ABC123XYZ9"""
    import random
    import string

    chars = string.ascii_uppercase + string.digits
    return "".join(random.choice(chars) for _ in range(length))


class PromoCreateRequest(BaseModel):
    limit: int = 25  # Bir kod kaç kişi kullanabilir
    note: str | None = None  # Admin notu (ör: "Arkadaş: Ali")


class PromoCreateResponse(BaseModel):
    code: str
    created_at: str
    limit: int
    used: int


class PromoValidateRequest(BaseModel):
    code: str


class PromoValidateResponse(BaseModel):
    valid: bool
    message: str
    reason: str = "ok"  # ok | invalid | limit


@router.post("/promo/create")
async def create_promo(req: PromoCreateRequest) -> PromoCreateResponse:
    """
    Yeni promo kod oluştur (SADECE ADMIN).
    Gerçek versiyonda bu endpoint şifrelenecek.
    """
    promos = _load_promos()
    code = _generate_code(10)

    # Kod zaten varsa yeniden oluştur
    while code in promos:
        code = _generate_code(10)

    promos[code] = {
        "created_at": datetime.utcnow().isoformat(),
        "limit": req.limit,
        "used": 0,
        "used_by": [],
        "note": req.note or "",
    }

    _save_promos(promos)

    return PromoCreateResponse(
        code=code,
        created_at=promos[code]["created_at"],
        limit=req.limit,
        used=0,
    )


@router.post("/promo/validate")
async def validate_promo(req: PromoValidateRequest) -> PromoValidateResponse:
    """
    Promo kodu doğrula. Kullanıcı ilk kez kullanıyorsa Pro status ver.
    """
    code = req.code.strip().upper()
    promos = _load_promos()

    if code not in promos:
        return PromoValidateResponse(valid=False, message="Geçersiz kod", reason="invalid")

    promo = promos[code]

    # Limit kontrol et
    if promo["used"] >= promo["limit"]:
        return PromoValidateResponse(valid=False, message="Bu kod limiti doldu", reason="limit")

    # Kodu kullanılmış olarak işaretle
    # Gerçek versiyonda device_id / user_id kullanılır
    promo["used"] += 1
    promo["used_by"].append(datetime.utcnow().isoformat())
    _save_promos(promos)

    # Tracking: promo kodu kullanildi
    track_promo_use(
        code=code,
        remaining=promo["limit"] - promo["used"],
        limit=promo["limit"],
        note=promo.get("note", ""),
    )

    return PromoValidateResponse(
        valid=True,
        message="Pro aktif edildi! Sınırsız analiz yapabilirsin.",
    )


@router.get("/promo/list")
async def list_promos() -> dict:
    """
    Tüm promo kodlarını listele (SADECE ADMIN).
    Gerçek versiyonda bu endpoint şifrelenecek.
    """
    return _load_promos()
