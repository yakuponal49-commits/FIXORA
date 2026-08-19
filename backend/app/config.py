from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", env_file_encoding="utf-8")

    # Gemini API anahtarlari. .env icinde JSON listesi olarak tanimlanir:
    #   GEMINI_API_KEYS=["key1","key2","key3","key4","key5"]
    # Bos ya da "PASTE_YOUR" ile baslayan anahtarlar yok sayilir.
    gemini_api_keys: list[str] = []

    # OpenAI-uyumlu Gemini ucu (degistirmenize gerek yok).
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai"

    # Anahtar+model rotasyonu icin kullanilabilecek modeller.
    # Oncelik secili modele verilir; 429 donerse bu listeden diger modellere gecilir.
    gemini_models: list[str] = ["gemini-3.5-flash", "gemini-3.1-flash-lite"]

    # Kota hatali (anahtar, model) kombinasyonunun dinlenme suresi (saniye).
    quota_cooldown_seconds: int = 600

    # Web demosu icin eski tek-anahtar destegi (geriye uyumluluk).
    google_api_key: str = ""

    default_language: str = "de"
    input_retention_minutes: int = 15
    promo_admin_key: str = ""

    @property
    def effective_api_keys(self) -> list[str]:
        keys = list(self.gemini_api_keys)
        if not keys and self.google_api_key:
            keys.insert(0, self.google_api_key)
        return [k for k in keys if k and not k.startswith("PASTE_YOUR")]


settings = Settings()
