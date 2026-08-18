import json
import os
import unicodedata
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["materials"])

ICONS_FILE = os.path.join(os.path.dirname(__file__), "../data/materials_icons.json")
DEFAULT_ICON = "🧰"

_LIBRARY: list[dict] | None = None


def _load_library() -> list[dict]:
    """Malzeme-ikon kutuphanesini yukler (bellekte cache'ler)."""
    global _LIBRARY
    if _LIBRARY is not None:
        return _LIBRARY
    try:
        with open(ICONS_FILE, "r", encoding="utf-8") as f:
            _LIBRARY = json.load(f)
    except Exception:
        _LIBRARY = []
    return _LIBRARY


def _norm(text: str) -> str:
    """Kucuk harf, aksansiz ve noktalama isaretsiz karsilastirma formu."""
    s = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    return "".join(ch for ch in s.lower() if ch.isalnum())


def _match(entry: dict, norm: str) -> bool:
    """Bir malzeme adi, entry'deki herhangi bir dildeki anahtar kelimeye esit mi?"""
    for lang in ("en", "de", "fr"):
        for kw in entry.get(lang, []):
            if kw and _norm(kw) == norm:
                return True
    return False


def _contain(entry: dict, norm: str) -> bool:
    """Cok kelimeli urun adlarinda (ornek 'Silikon Dichtungsmasse') anahtar kelime
    alt-uyesiyse eslestir. Cok kisa ve genel kelimelerde yanlis eslesmeyi onlemek
    icin 4+ karakterli anahtar kelimeler aranir."""
    if len(norm) < 4:
        return False
    for lang in ("en", "de", "fr"):
        for kw in entry.get(lang, []):
            kn = _norm(kw)
            if len(kn) >= 4 and kn in norm:
                return True
    return False


def resolve_icons(items: list[str], language: str) -> list[dict]:
    """Her malzeme icin uygun ikonu bulur. Oncelik sirasi:
    1) Tam eslesme (istenen dil once, sonra tum diller)
    2) Alt-uyelik (contains) eslesmesi
    3) Varsayilan arac ikonu
    """
    library = _load_library()
    language = language if language in ("de", "fr") else "en"
    out: list[dict] = []
    for raw in items:
        norm = _norm(raw)
        icon: str | None = None
        if norm:
            # 1) Tam eslesme - once kullanici dili
            icon = next(
                (e["icon"] for e in library if any(_norm(kw) == norm for kw in e.get(language, []))),
                None,
            )
            # 1b) Tam eslesme - herhangi bir dil
            if icon is None:
                icon = next((e["icon"] for e in library if _match(e, norm)), None)
            # 2) Alt-uyelik eslesmesi
            if icon is None:
                icon = next((e["icon"] for e in library if _contain(e, norm)), None)
        out.append({"name": raw, "icon": icon or DEFAULT_ICON})
    return out


class MaterialsIconsRequest(BaseModel):
    items: list[str] = []
    language: Literal["de", "fr", "en"] = "en"


class MaterialsIconsResponse(BaseModel):
    items: list[dict]


@router.post("/materials/icons", response_model=MaterialsIconsResponse)
async def materials_icons(req: MaterialsIconsRequest) -> MaterialsIconsResponse:
    """
    Verilen malzeme/ekipman adlarinin her biri icin temsil ikonunu dondurur.
    Ikonlar AI tarafindan URETILMEZ; backend'deki kutuphaneden (materials_icons.json)
    cok dilli anahtar kelime eslemesiyle secilir. Eslesmeyen adlar varsayilan
    arac ikonunu (🧰) alir.
    """
    items = [it for it in (x.strip() for x in req.items) if it][:200]
    return MaterialsIconsResponse(items=resolve_icons(items, req.language))
