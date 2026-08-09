"""Gemini'ye OpenAI-uyumlu /chat/completions ucuyla baglanir.

Anahtar + model rotasyonu burada yapilir: bir (anahtar, model) kombinasyonu
429 (kota) donerse o kombinasyon kisa sure dinlendirilir ve istek otomatik
olarak diger kombinasyonlarla yeniden denenir.
"""

import json
import random
import time

import httpx
from fastapi import HTTPException

from ..config import settings

BASE_URL = settings.gemini_base_url
KEYS = settings.effective_api_keys
MODELS = list(settings.gemini_models) or ["gemini-3.5-flash"]
DEFAULT_MODEL = MODELS[0]
COOLDOWN_SECONDS = max(30, settings.quota_cooldown_seconds)
cooldown_until: dict[tuple[int, str], float] = {}

LANGUAGE_NAMES = {
    "de": "Deutsch",
    "fr": "Français",
    "en": "English",
}

# Bölüm başlıkları: AI bu başlıkları AYNEN kullanır, uygulama bunları
# ayrı ayrı stillenmiş kartlar halinde çizer (güvenlik kutusu, numaralı
# adımlar, maliyet kartları vb.).
HEADINGS = {
    "en": {
        "safety": "Safety First",
        "steps": "Step-by-Step Solution",
        "pro": "When to Call a Professional",
        "check": "Post-Repair Check",
        "prevent": "Preventive Tips",
        "accuracy": "Accuracy",
        "cost": "Cost Breakdown",
    },
    "de": {
        "safety": "Sicherheit zuerst",
        "steps": "Schritt-für-Schritt-Lösung",
        "pro": "Wann einen Profi rufen?",
        "check": "Prüfung nach der Reparatur",
        "prevent": "Vorbeugende Tipps",
        "accuracy": "Genauigkeit",
        "cost": "Kostenübersicht",
    },
    "fr": {
        "safety": "Sécurité d'abord",
        "steps": "Solution étape par étape",
        "pro": "Quand appeler un professionnel ?",
        "check": "Vérification après réparation",
        "prevent": "Conseils préventifs",
        "accuracy": "Précision",
        "cost": "Aperçu des coûts",
    },
}

# Adım alt alan etiketleri (dil başına): AI her adımda bu etiketleri AYNEN
# "Etiket: değer" biçiminde kullanır. Uygulama bunları ayrı satırlar olarak
# algılar (Neden / Gereken Aletler / Beklenen Sonuç / Beklenen Değilse /
# Güvenlik / Zorluk / Süre) ve rakip ekranındaki gibi gösterir.
STEP_FIELDS = {
    "en": {
        "why": "Why",
        "tools": "Tools needed",
        "expected": "Expected result",
        "ifNot": "If not as expected",
        "safety": "Safety",
        "difficulty": "Difficulty",
        "duration": "Duration",
    },
    "de": {
        "why": "Warum",
        "tools": "Benötigte Werkzeuge",
        "expected": "Erwartetes Ergebnis",
        "ifNot": "Falls nicht wie erwartet",
        "safety": "Sicherheit",
        "difficulty": "Schwierigkeit",
        "duration": "Dauer",
    },
    "fr": {
        "why": "Pourquoi",
        "tools": "Outils nécessaires",
        "expected": "Résultat attendu",
        "ifNot": "Si ce n'est pas le cas",
        "safety": "Sécurité",
        "difficulty": "Difficulté",
        "duration": "Durée",
    },
}

SYSTEM_INSTRUCTION = (
    "You are NOT a general chat bot. You are a specialized expert home-repair, maintenance and troubleshooting assistant for Switzerland.\n"
    "Your role is strictly limited: the user will describe a device or item fault / a renovation problem in their own words and may attach a photo or video. You must evaluate exactly that submitted data (their description + their images) and inform the user according to the FIXORA answer-page design and its section headings defined below (Safety First, Step-by-Step Solution, When to Call a Professional, Post-Repair Check, Preventive Tips, Accuracy, Cost Breakdown and the per-step sub-fields).\n"
    "Never behave like a general-purpose chatbot: do NOT answer off-topic questions, do NOT chat about the weather, do NOT give generic life advice, do NOT discuss anything unrelated to the submitted repair/renovation problem. If the user asks something outside your repair-assistant role, politely redirect them to describe the fault they want to fix.\n"
    "You must NOT answer with generic, textbook information. Your only job is to diagnose THIS specific problem the user described with their own words and/or photos in THEIR exact case.\n"
    "Always:\n"
    "1. Analyze ONLY the concrete symptoms, images, video frame(s) and context the user provided. Do not invent unrelated facts and do not give broad general lessons.\n"
    "2. If the user attached photo(s)/video but wrote little or no description, examine the images carefully and CONFIRM what you actually observe before diagnosing. Briefly state what you see (e.g. \"I see water dripping from the faucet\" or \"I see a broken hinge\") and ask the user to confirm or correct it with YES / NO options. Do not guess the final cause yet.\n"
    "3. If you do NOT yet have enough detail to identify the real cause, do NOT dump the full sections below. Instead reply ONLY with a short intro and the STRUCTURED QUESTION BLOCK (see below) to narrow it down.\n"
    "4. Use the user\u2019s answers to converge step by step until the most consistent fault for THIS case is found, then give the structured repair answer.\n"
    "5. State the risk level (LOW / MEDIUM / HIGH) and warn when electricity, gas, water pressure, or structures are involved. Never encourage risky DIY.\n"
    "6. Recommend calling a professional when risk is MEDIUM or HIGH or when unsure.\n"
    "7. Be honest about uncertainty.\n"
    "8. Answer in the user requested language ({language}).\n"
    "9. You may ask at most TWO diagnostic questions in one reply. Prefer just one.\n"
    "10. Use **bold** for important points, safety warnings and key numbers. Keep paragraphs short and scannable. Do not write huge walls of text.\n"
    "11. FINAL ANSWER STRUCTURE - when you have enough data to give the repair, produce your ENTIRE reply in EXACTLY these sections, in THIS order. Each section heading starts with ## and uses the EXACT heading text from the table at the end (per language):\n"
    "   ## <SAFETY heading>\n"
    "      - first a line exactly: RISK: HIGH / RISK: MEDIUM / RISK: LOW\n"
    "      - then a short bullet list of the specific safety warnings for THIS repair (electricity/gas/water/heat/height, protective gear, risk of injury). Only real, case-specific warnings.\n"
    "   ## <STEPS heading>\n"
    "      - first one short line \"Problem: <1-2 sentence summary of the diagnosed fault>\".\n"
    "      - then the repair instructions as a NUMBERED list (1. 2. 3. ...). Each step must be a concrete action a non-expert can follow. Do not skip tools or steps.\n"
    "      - After EACH numbered step, on the next lines, repeat the STEP SUB-FIELD LABELS (from the table at the end, in the user's language) with the value, in this exact order. Write each as \"<Label>: <value>\" on its own line:\n"
    "         <Why label>: <1-2 sentences why this step matters>\n"
    "         <Tools label>: <comma-separated tools needed for this step, or \"None\"/\"Yok\">\n"
    "         <Expected label>: <the concrete expected result after this step>\n"
    "         <If-not label>: <what to do if the expected result is NOT achieved>\n"
    "         <Safety label>: <specific safety warning for this step>\n"
    "         <Difficulty label>: <Beginner | Intermediate | Advanced>\n"
    "         <Duration label>: <estimated time, e.g. 20 min or 10 min>\n"
    "   ## <PRO heading>\n"
    "      - a short bullet list of the concrete conditions when the user MUST call a professional in THIS case (e.g. gas smell, burst pipe, wiring behind wall, unsure, no shutoff valve).\n"
    "   ## <CHECK heading>\n"
    "      - a short numbered or bullet list of what to verify after the repair is finished (leak test, reconnect, observe).\n"
    "   ## <PREVENT heading>\n"
    "      - 3 to 6 practical bullet tips to prevent this problem from recurring.\n"
    "   ## <ACCURACY heading>\n"
    "      - first a line exactly: CONFIDENCE: HIGH / CONFIDENCE: MEDIUM / CONFIDENCE: LOW\n"
    "      - then one short sentence explaining how confident you are that this diagnosis fits THIS case (based on the evidence/photos).\n"
    "   ## <COST heading>\n"
    "      - one line \"DIY: <estimated material cost in EUR or CHF, range>\".\n"
    "      - one line \"Pro: <estimated professional repair cost in EUR or CHF, range>\".\n"
    "      - one line \"Save: <estimated savings amount>\" (pro minus diy).\n"
    "      - then one short honest line that these are rough estimates and local prices vary.\n"
    "12. HEADING TABLE (use these EXACT texts, replacing <SAFETY> etc.):\n"
    "    English: SAFETY=\"Safety First\", STEPS=\"Step-by-Step Solution\", PRO=\"When to Call a Professional\", CHECK=\"Post-Repair Check\", PREVENT=\"Preventive Tips\", ACCURACY=\"Accuracy\", COST=\"Cost Breakdown\".\n"
    "    Deutsch: SAFETY=\"Sicherheit zuerst\", STEPS=\"Schritt-für-Schritt-Lösung\", PRO=\"Wann einen Profi rufen?\", CHECK=\"Prüfung nach der Reparatur\", PREVENT=\"Vorbeugende Tipps\", ACCURACY=\"Genauigkeit\", COST=\"Kostenübersicht\".\n"
    "    Français: SAFETY=\"Sécurité d'abord\", STEPS=\"Solution étape par étape\", PRO=\"Quand appeler un professionnel ?\", CHECK=\"Vérification après réparation\", PREVENT=\"Conseils préventifs\", ACCURACY=\"Précision\", COST=\"Aperçu des coûts\".\n"
    "    Only include a section if it is genuinely relevant to THIS case, but always include SAFETY, STEPS, ACCURACY and COST.\n"
    "12b. STEP SUB-FIELD LABELS TABLE (use these EXACT \"Label: value\" texts after each numbered step, in the user's language; translate only the VALUES):\n"
    "    English: Why / Tools needed / Expected result / If not as expected / Safety / Difficulty / Duration\n"
    "    Deutsch: Warum / Benötigte Werkzeuge / Erwartetes Ergebnis / Falls nicht wie erwartet / Sicherheit / Schwierigkeit / Dauer\n"
    "    Français: Pourquoi / Outils nécessaires / Résultat attendu / Si ce n'est pas le cas / Sécurité / Difficulté / Durée\n"
    "    Difficulty values: Beginner / Intermediate / Advanced. Duration example: 20 min.\n"
    "13. STRUCTURED QUESTION BLOCK - when you need a confirm/diagnostic answer (rule 3), end your reply with EXACTLY this format (separate lines):\n"
    "QUESTION_BLOCK_START\n"
    "<The precise question for THIS case, e.g. \"Does the water heater ignite and then shut off after 30 seconds?\" or \"I see water under the sink. Is that what you want to fix? Yes or no?\">\n"
    "OPTIONS_START\n"
    "Option one\n"
    "Option two\n"
    "Option three\n"
    "OPTIONS_END\n"
    "QUESTION_BLOCK_END\n"
    "   Provide 2 to 4 realistic answer options tailored to THIS case. Do NOT use this block when you already have enough data; give the structured sections above only.\n"
    "14. When the user later replies (an option they picked or free text), treat it as continuous conversation, update the diagnosis for THIS case and answer with the same structured sections in the same language.\n"
)


def language_name(lang: str) -> str:
    return LANGUAGE_NAMES.get(lang, "Deutsch")


def get_system_instruction(language: str) -> str:
    return SYSTEM_INSTRUCTION.replace("{language}", language_name(language))


class QuotaError(Exception):
    pass


def _is_quota(resp: httpx.Response) -> bool:
    if resp.status_code == 429:
        return True
    try:
        msg = resp.json().get("error", {}).get("message", "").lower()
    except Exception:
        msg = ""
    return "quota" in msg or "resource_exhausted" in msg or "rate limit" in msg


def _is_model_not_supported(resp: httpx.Response) -> bool:
    if resp.status_code == 404:
        return True
    try:
        msg = resp.json().get("error", {}).get("message", "").lower()
    except Exception:
        msg = ""
    return "model" in msg and ("not found" in msg or "does not exist" in msg or "not available" in msg)


def _provider_error(resp: httpx.Response, raw: bytes | None = None) -> HTTPException:
    message = ""
    if raw:
        message = raw.decode("utf-8", errors="replace").strip()[:400]
    if not message:
        try:
            message = resp.json().get("error", {}).get("message", "")
        except Exception:
            pass
    detail = message or f"AI provider error (HTTP {resp.status_code})."
    return HTTPException(status_code=502, detail=detail)


def _headers(key: str) -> dict[str, str]:
    return {"Content-Type": "application/json", "Authorization": f"Bearer {key}"}


async def chat_json(messages: list[dict], preferred_model: str) -> str:
    """Tek parca (streaming'siz) cevap dondurur."""

    async def attempt(key: str, model: str) -> str:
        body = {"model": model, "messages": messages, "max_tokens": 8192}
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(f"{BASE_URL}/chat/completions", json=body, headers=_headers(key))
        if resp.status_code != 200:
            if _is_quota(resp):
                raise QuotaError()
            if _is_model_not_supported(resp):
                raise HTTPException(status_code=404, detail="MODEL_NOT_SUPPORTED")
            raise _provider_error(resp)
        data = resp.json()
        content = (data.get("choices") or [{}])[0].get("message", {}).get("content")
        if isinstance(content, str) and content.strip():
            try:
                with open(r"C:\Users\barda\AppData\Local\Temp\opencode\trace_chat.txt", "a", encoding="utf-8") as f:
                    f.write(f"CHAT_FULL_REPR={content!r}\n---END---\n")
            except Exception:
                pass
            return content
        if isinstance(content, list) and content:
            return "".join(p.get("text", "") for p in content if isinstance(p, dict))
        raise HTTPException(status_code=502, detail="EMPTY")

    return await _with_key_fallback(preferred_model, attempt)


async def chat_stream(messages: list[dict], preferred_model: str):
    """SSE stream olarak biriken metni verir: data: {"text": "<biriken>"}"""

    async def attempt(key: str, model: str):
        body = {"model": model, "messages": messages, "max_tokens": 8192, "stream": True}
        async with httpx.AsyncClient(timeout=300) as client:
            async with client.stream(
                "POST", f"{BASE_URL}/chat/completions", json=body, headers=_headers(key)
            ) as resp:
                if resp.status_code != 200:
                    raw = await resp.aread()
                    if _is_quota(resp):
                        raise QuotaError()
                    if _is_model_not_supported(resp):
                        raise HTTPException(status_code=404, detail="MODEL_NOT_SUPPORTED")
                    raise _provider_error(resp, raw)
                full_text = ""
                buffer = ""
                async for chunk in resp.aiter_bytes():
                    buffer += chunk.decode("utf-8", errors="replace")
                    while "\n" in buffer:
                        line, buffer = buffer.split("\n", 1)
                        delta = _parse_sse_line(line)
                        if delta:
                            full_text += delta
                            yield full_text
                try:
                    with open(r"C:\Users\barda\AppData\Local\Temp\opencode\trace_stream.txt", "a", encoding="utf-8") as f:
                        f.write(f"STREAM_FULL_REPR={full_text!r}\n---END---\n")
                except Exception:
                    pass

    keys = list(range(len(KEYS)))
    random.shuffle(keys)
    models = [preferred_model] + [m for m in MODELS if m != preferred_model]
    last_err: HTTPException | None = None
    for i in keys:
        for model in models:
            if time.time() < cooldown_until.get((i, model), 0):
                last_err = last_err or HTTPException(status_code=429, detail="QUOTA")
                continue
            try:
                async for full in attempt(KEYS[i], model):
                    yield full
                return
            except QuotaError:
                cooldown_until[(i, model)] = time.time() + COOLDOWN_SECONDS
                last_err = HTTPException(status_code=429, detail="QUOTA")
            except HTTPException:
                raise
    raise last_err or HTTPException(status_code=429, detail="QUOTA")


async def _with_key_fallback(preferred_model: str, request):
    keys = list(range(len(KEYS)))
    random.shuffle(keys)
    models = [preferred_model] + [m for m in MODELS if m != preferred_model]
    last_err: HTTPException | None = None
    for i in keys:
        for model in models:
            if time.time() < cooldown_until.get((i, model), 0):
                last_err = last_err or HTTPException(status_code=429, detail="QUOTA")
                continue
            try:
                result = await request(KEYS[i], model)
                cooldown_until.pop((i, model), None)
                return result
            except QuotaError:
                cooldown_until[(i, model)] = time.time() + COOLDOWN_SECONDS
                last_err = HTTPException(status_code=429, detail="QUOTA")
            except HTTPException:
                raise
    raise last_err or HTTPException(status_code=429, detail="QUOTA")


def _parse_sse_line(line: str) -> str:
    t = line.strip()
    if not t.startswith("data:"):
        return ""
    data = t[len("data:"):].strip()
    if not data or data == "[DONE]":
        return ""
    try:
        payload = json.loads(data)
    except json.JSONDecodeError:
        return ""
    if payload.get("error"):
        msg = str(payload["error"]).lower()
        if "quota" in msg or "resource_exhausted" in msg:
            raise QuotaError()
        raise HTTPException(status_code=502, detail=msg[:400])
    delta = (payload.get("choices") or [{}])[0].get("delta", {}).get("content")
    if isinstance(delta, str):
        return delta
    if isinstance(delta, list):
        return "".join(d.get("text", "") for d in delta if isinstance(d, dict))
    return ""
