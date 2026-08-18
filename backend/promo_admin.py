#!/usr/bin/env python3
"""
FIXORA Promo Code Management Tool
Promo kodları oluştur, görüntüle ve yönet.

Kullanım:
  python promo_admin.py create --limit 25 --note "Friend: Ali"
  python promo_admin.py list
  python promo_admin.py validate ABC123XYZ9
"""

import json
import os
import sys
import random
import string
from datetime import datetime
from pathlib import Path

PROMO_FILE = Path(__file__).parent / "app" / "data" / "promo_codes.json"


def ensure_promo_file():
    """Promo file'ı yoksa oluştur."""
    PROMO_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not PROMO_FILE.exists():
        PROMO_FILE.write_text(json.dumps({}, indent=2))


def load_promos() -> dict:
    """Promo kodlarını yükle."""
    ensure_promo_file()
    try:
        return json.loads(PROMO_FILE.read_text())
    except Exception:
        return {}


def save_promos(promos: dict):
    """Promo kodlarını kaydet."""
    ensure_promo_file()
    PROMO_FILE.write_text(json.dumps(promos, indent=2, ensure_ascii=False), encoding='utf-8')


def generate_code(length: int = 10) -> str:
    """Rastgele promo kod oluştur: ABC123XYZ9"""
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choice(chars) for _ in range(length))


def cmd_create(limit: int = 25, note: str = ""):
    """Yeni promo kod oluştur."""
    promos = load_promos()
    code = generate_code(10)

    while code in promos:
        code = generate_code(10)

    promos[code] = {
        "created_at": datetime.utcnow().isoformat(),
        "limit": limit,
        "used": 0,
        "used_by": [],
        "note": note or "",
    }

    save_promos(promos)
    print(f"✅ Kod oluşturuldu: {code}")
    print(f"   Limit: {limit} kişi")
    print(f"   Not: {note or '(yok)'}")
    return code


def cmd_list():
    """Tüm promo kodlarını listele."""
    promos = load_promos()
    if not promos:
        print("Promo kod yok.")
        return

    print(f"\n{'KOD':<12} {'LIMIT':<8} {'KULLANILDI':<12} {'NOT':<30}")
    print("-" * 70)
    for code, data in promos.items():
        note = (data.get("note", "") or "")[:28]
        print(f"{code:<12} {data['limit']:<8} {data['used']:<12} {note:<30}")


def cmd_validate(code: str):
    """Promo kodu doğrula ve kullanılmış olarak işaretle."""
    promos = load_promos()
    code = code.strip().upper()

    if code not in promos:
        print(f"❌ Kod bulunamadı: {code}")
        return

    promo = promos[code]
    if promo["used"] >= promo["limit"]:
        print(f"❌ Kod limiti doldu: {promo['used']}/{promo['limit']}")
        return

    promo["used"] += 1
    promo["used_by"].append(datetime.utcnow().isoformat())
    save_promos(promos)

    print(f"✅ Kod doğrulandı: {code}")
    print(f"   Kullanıldı: {promo['used']}/{promo['limit']}")


def cmd_reset(code: str):
    """Promo kodunu sıfırla."""
    promos = load_promos()
    code = code.strip().upper()

    if code not in promos:
        print(f"❌ Kod bulunamadı: {code}")
        return

    promos[code]["used"] = 0
    promos[code]["used_by"] = []
    save_promos(promos)
    print(f"✅ Kod sıfırlandı: {code}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Kullanım: python promo_admin.py [create|list|validate|reset] [args...]")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "create":
        limit = int(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[2] == "--limit" else 25
        note = sys.argv[5] if len(sys.argv) > 5 and sys.argv[4] == "--note" else ""
        cmd_create(limit, note)
    elif cmd == "list":
        cmd_list()
    elif cmd == "validate":
        if len(sys.argv) < 3:
            print("Kod belirtiniz: python promo_admin.py validate ABC123XYZ9")
            sys.exit(1)
        cmd_validate(sys.argv[2])
    elif cmd == "reset":
        if len(sys.argv) < 3:
            print("Kod belirtiniz: python promo_admin.py reset ABC123XYZ9")
            sys.exit(1)
        cmd_reset(sys.argv[2])
    else:
        print(f"Bilinmeyen komut: {cmd}")
        sys.exit(1)
