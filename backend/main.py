from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from datetime import datetime, timezone, timedelta
from collections import Counter
import asyncio, random, smtplib, os
from concurrent.futures import ThreadPoolExecutor
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from auth import hash_password, verify_password, sanitize_username
from db import users_collection, predictions_collection, otp_collection
from model import predict_image, generate_gradcam
from chatbot import answer_question, build_report, get_disease_info

SMTP_EMAIL    = os.environ.get("SMTP_EMAIL", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

def send_otp_email(to_email: str, otp: str):
    msg = MIMEText(f"Your PlantGuard AI OTP is: {otp}\n\nValid for 10 minutes.")
    msg["Subject"] = "PlantGuard AI – Email Verification OTP"
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
        s.login(SMTP_EMAIL, SMTP_PASSWORD)
        s.sendmail(SMTP_EMAIL, to_email, msg.as_string())

app = FastAPI()
_executor = ThreadPoolExecutor(max_workers=2)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend static files
_frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.isdir(_frontend_dir):
    app.mount("/app", StaticFiles(directory=_frontend_dir, html=True), name="frontend")

@app.get("/")
def root():
    index = os.path.join(_frontend_dir, "login.html")
    if os.path.exists(index):
        return FileResponse(index)
    return {"message": "PlantGuard AI backend running"}


@app.post("/send-otp")
def send_otp(email: str = Form(...)):
    import re
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address")
    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    otp = str(random.randint(100000, 999999))
    expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
    otp_collection.replace_one(
        {"email": email},
        {"email": email, "otp": otp, "expires_at": expiry},
        upsert=True
    )
    try:
        send_otp_email(email, otp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")
    return {"message": "OTP sent"}


@app.post("/send-reset-otp")
def send_reset_otp(email: str = Form(...)):
    import re
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address")
    if not users_collection.find_one({"email": email}):
        raise HTTPException(status_code=404, detail="No account found with this email")
    otp = str(random.randint(100000, 999999))
    expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
    otp_collection.replace_one(
        {"email": email},
        {"email": email, "otp": otp, "expires_at": expiry, "purpose": "reset"},
        upsert=True
    )
    try:
        msg = MIMEText(f"Your PlantGuard AI password reset OTP is: {otp}\n\nValid for 10 minutes. If you did not request this, ignore this email.")
        msg["Subject"] = "PlantGuard AI – Password Reset OTP"
        msg["From"] = SMTP_EMAIL
        msg["To"] = email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
            s.login(SMTP_EMAIL, SMTP_PASSWORD)
            s.sendmail(SMTP_EMAIL, email, msg.as_string())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")
    return {"message": "Reset OTP sent"}


@app.post("/verify-reset-otp")
def verify_reset_otp(email: str = Form(...), otp: str = Form(...)):
    record = otp_collection.find_one({"email": email})
    if not record or record["otp"] != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if record["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")
    return {"message": "OTP verified"}


@app.post("/reset-password")
def reset_password(email: str = Form(...), otp: str = Form(...), new_password: str = Form(...)):
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    record = otp_collection.find_one({"email": email})
    if not record or record["otp"] != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if record["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")
    users_collection.update_one({"email": email}, {"$set": {"password": hash_password(new_password)}})
    otp_collection.delete_one({"email": email})
    return {"message": "Password reset successful"}


@app.post("/signup")
def signup(username: str = Form(...), email: str = Form(...), password: str = Form(...), otp: str = Form(...)):
    record = otp_collection.find_one({"email": email})
    if not record or record["otp"] != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if record["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")
    clean_name = sanitize_username(username)
    if not clean_name:
        raise HTTPException(status_code=400, detail="Invalid username")
    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    users_collection.insert_one({
        "username": clean_name,
        "email": email,
        "password": hash_password(password),
    })
    otp_collection.delete_one({"email": email})
    return {"message": "Signup successful"}


@app.post("/login")
def login(email: str = Form(...), password: str = Form(...)):
    user = users_collection.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"message": "Login successful", "email": email, "username": user["username"]}


@app.post("/update-profile")
def update_profile(email: str = Form(...), new_username: str = Form(default=""), new_password: str = Form(default=""), current_password: str = Form(...)):
    user = users_collection.find_one({"email": email})
    if not user or not verify_password(current_password, user["password"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    updates = {}
    if new_username.strip():
        from auth import sanitize_username
        clean = sanitize_username(new_username)
        if not clean:
            raise HTTPException(status_code=400, detail="Invalid username")
        updates["username"] = clean
    if new_password:
        if len(new_password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        updates["password"] = hash_password(new_password)
    if not updates:
        raise HTTPException(status_code=400, detail="Nothing to update")
    users_collection.update_one({"email": email}, {"$set": updates})
    return {"message": "Profile updated", "username": updates.get("username", user["username"])}


@app.post("/predict")
async def predict(email: str = Form(...), file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image file")

    image_bytes = await file.read()

    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(_executor, predict_image, image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    # Only save valid plant disease predictions — skip rejected/not-a-plant results
    if not result.get("rejected", False):
        predictions_collection.insert_one({
            "email": email,
            "filename": file.filename,
            "prediction": result["label"],
            "confidence": result["confidence"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

        # Send severity alert email for high-severity diseases
        label = result["label"]
        HIGH_SEVERITY_KEYWORDS = ["Late_blight", "Haunglongbing", "Yellow_Leaf_Curl", "mosaic_virus", "Esca"]
        if any(k in label for k in HIGH_SEVERITY_KEYWORDS) and result["confidence"] >= 0.75:
            try:
                alert_body = f"""⚠️ HIGH SEVERITY DISEASE DETECTED

Disease: {label.replace('___', ' › ').replace('_', ' ')}
Confidence: {round(result['confidence']*100, 1)}%
File: {file.filename}
Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}

Immediate action is recommended. Open PlantGuard AI for full treatment details."""
                alert_msg = MIMEText(alert_body)
                alert_msg["Subject"] = f"🚨 PlantGuard AI Alert – High Severity Disease Detected"
                alert_msg["From"] = SMTP_EMAIL
                alert_msg["To"] = email
                with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
                    s.login(SMTP_EMAIL, SMTP_PASSWORD)
                    s.sendmail(SMTP_EMAIL, email, alert_msg.as_string())
            except Exception:
                pass

    return {
        "prediction": result["label"],
        "confidence": round(result["confidence"], 4),
        "top3": result.get("top3", []),
        "class_idx": result.get("class_idx"),
        "rejected": result.get("rejected", False),
    }


@app.post("/gradcam")
async def gradcam(file: UploadFile = File(...), class_idx: int = Form(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image file")
    image_bytes = await file.read()
    try:
        loop = asyncio.get_event_loop()
        heatmap_b64 = await loop.run_in_executor(_executor, generate_gradcam, image_bytes, class_idx)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grad-CAM failed: {str(e)}")
    if not heatmap_b64:
        raise HTTPException(status_code=422, detail="Could not generate heatmap for this model")
    return {"heatmap": heatmap_b64}


@app.get("/history")
def history(email: str, page: int = 1, per_page: int = 10):
    skip = (page - 1) * per_page
    total = predictions_collection.count_documents({"email": email})
    records = predictions_collection.find(
        {"email": email},
        {"_id": 0, "filename": 1, "prediction": 1, "confidence": 1, "timestamp": 1}
    ).sort("timestamp", -1).skip(skip).limit(per_page)
    return {"history": list(records), "total": total, "page": page, "per_page": per_page}


@app.delete("/history/delete")
def delete_history_item(email: str = Form(...), timestamp: str = Form(...)):
    result = predictions_collection.delete_one({"email": email, "timestamp": timestamp})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Deleted"}


@app.get("/stats")
def stats(email: str):
    records = list(predictions_collection.find({"email": email}, {"_id": 0, "prediction": 1, "timestamp": 1}))
    total = len(records)
    healthy = sum(1 for r in records if "healthy" in r["prediction"].lower())
    diseased = total - healthy
    top = Counter(r["prediction"] for r in records if "healthy" not in r["prediction"].lower()).most_common(3)
    # Build daily scan trend for last 14 days
    from collections import defaultdict
    daily = defaultdict(int)
    for r in records:
        try:
            day = r["timestamp"][:10]  # YYYY-MM-DD
            daily[day] += 1
        except Exception:
            pass
    trend = sorted(daily.items())[-14:]
    return {"total": total, "healthy": healthy, "diseased": diseased, "top_diseases": top, "trend": trend}


async def _call_grok(system_prompt: str, prior: list, max_tokens: int = 512):
    """Call Groq API (free tier). prior is list of {role, content} dicts."""
    import httpx
    key = os.environ.get("GROQ_API_KEY", "").strip()
    if not key:
        print("[Groq] No GROQ_API_KEY found")
        return None
    messages = [{"role": "system", "content": system_prompt}]
    for msg in prior:
        role = "assistant" if msg.get("role") == "assistant" else "user"
        messages.append({"role": role, "content": msg.get("content", "")})
    models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"]
    for model in models:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                    json={"model": model, "messages": messages, "max_tokens": max_tokens},
                )
            print(f"[Groq] {model} -> HTTP {resp.status_code}")
            if resp.status_code == 429:
                print(f"[Groq] Rate limit on {model}, trying next")
                continue
            if resp.status_code != 200:
                print(f"[Groq] Error: {resp.text[:300]}")
                continue
            return resp.json()["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"[Groq error] {model}: {type(e).__name__}: {e}")
            continue
    return None


@app.post("/grok-chat")
async def grok_chat(
    question: str = Form(...),
    history: str = Form(default=""),
):
    if not question.strip():
        raise HTTPException(status_code=400, detail="question is required")
    import json as _json
    try:
        prior = _json.loads(history) if history else []
    except Exception:
        prior = []
    system_prompt = (
        "You are Grok, a helpful AI assistant built by xAI, embedded in PlantGuard AI — "
        "a plant disease detection app. Answer questions about plant care, diseases, "
        "agriculture, and general topics. Be concise, friendly, use emojis sparingly."
    )
    prior.append({"role": "user", "content": question})
    reply = await _call_grok(system_prompt, prior)
    if reply:
        return {"reply": reply, "source": "grok"}
    return {"reply": "AI is currently unavailable. Please add your GROQ_API_KEY in .env", "source": "error"}


async def _call_gemini(system_prompt: str, contents: list, max_tokens: int = 512):
    """Try all available Gemini key+model combos. Returns reply text or None."""
    import httpx
    models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash"]
    keys = [k for k in [
        os.environ.get("GEMINI_API_KEY", ""),
        os.environ.get("GEMINI_API_KEY_2", ""),
        os.environ.get("GEMINI_API_KEY_3", ""),
    ] if k.strip()]
    if not keys:
        print("[Gemini] No API key found in environment")
        return None
    for key in keys:
        for model in models:
            try:
                body = [
                    {"role": "user", "parts": [{"text": system_prompt}]},
                    {"role": "model", "parts": [{"text": "Understood."}]},
                ] + contents
                async with httpx.AsyncClient(timeout=30) as client:
                    resp = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}",
                        headers={"Content-Type": "application/json"},
                        json={"contents": body, "generationConfig": {"maxOutputTokens": max_tokens}},
                    )
                print(f"[Gemini] {model} -> HTTP {resp.status_code}")
                if resp.status_code == 429:
                    print(f"[Gemini] 429 body: {resp.text[:300]}")
                    continue
                if resp.status_code in (400, 404, 503):
                    print(f"[Gemini] {resp.status_code} body: {resp.text[:300]}")
                    continue
                resp.raise_for_status()
                return resp.json()["candidates"][0]["content"]["parts"][0]["text"]
            except Exception as e:
                print(f"[Gemini error] {model}: {type(e).__name__}: {e}")
                continue
    return None


@app.post("/chat")
async def chat(
    disease: str = Form(...),
    question: str = Form(...),
    lang: str = Form(default="en"),
    history: str = Form(default=""),
):
    if not disease or not question.strip():
        raise HTTPException(status_code=400, detail="disease and question are required")

    import json as _json
    try:
        prior = _json.loads(history) if history else []
    except Exception:
        prior = []

    if os.environ.get("GEMINI_API_KEY", ""):
        info = get_disease_info(disease, lang)
        system_prompt = (
            "You are Plant Doctor AI, an expert agronomist assistant embedded in PlantGuard AI. "
            "You help farmers and gardeners understand plant diseases, treatments, and prevention. "
            "Be concise, practical, and friendly. Use emojis sparingly. "
            "Always base your answers on the disease context provided.\n"
            f"Detected disease context:\n{build_report(info)}"
        )
        contents = []
        for msg in prior:
            contents.append({"role": "model" if msg.get("role") == "assistant" else "user", "parts": [{"text": msg["content"]}]})
        contents.append({"role": "user", "parts": [{"text": question}]})
        reply = await _call_gemini(system_prompt, contents)
        if reply:
            return {"reply": reply, "source": "gemini"}

    return {"reply": answer_question(disease, question, lang), "source": "local"}


@app.post("/gemini-chat")
async def gemini_chat(
    question: str = Form(...),
    history: str = Form(default=""),
):
    """Free-form Gemini chat — not disease-locked."""
    if not question.strip():
        raise HTTPException(status_code=400, detail="question is required")

    import json as _json
    try:
        prior = _json.loads(history) if history else []
    except Exception:
        prior = []

    system_prompt = (
        "You are Gemini AI, a helpful assistant embedded in PlantGuard AI — a plant disease detection app. "
        "You can answer questions about plant care, diseases, agriculture, and general topics. "
        "Be concise, friendly, and use emojis sparingly."
    )
    contents = []
    for msg in prior:
        contents.append({"role": "model" if msg.get("role") == "assistant" else "user", "parts": [{"text": msg["content"]}]})
    contents.append({"role": "user", "parts": [{"text": question}]})

    reply = await _call_gemini(system_prompt, contents)
    if reply:
        return {"reply": reply, "source": "gemini"}
    return {"reply": "Gemini is currently unavailable. Please check your API key or try again later.", "source": "error"}


@app.post("/email-report")
def email_report(email: str = Form(...), disease: str = Form(...), confidence: str = Form(default="")):
    info = get_disease_info(disease)
    name = info["disease"].replace("___", " › ").replace("_", " ")
    html_body = f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#059669;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:1.4rem">🌿 PlantGuard AI — Disease Report</h1>
      </div>
      <div style="padding:28px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
        <h2 style="font-size:1.3rem;color:#0f172a;text-transform:capitalize;margin-bottom:4px">{name}</h2>
        {f'<p style="color:#059669;font-weight:700;margin-bottom:20px">Confidence: {confidence}</p>' if confidence else ''}
        <div style="background:#f8fafc;border-left:4px solid #dc2626;border-radius:6px;padding:14px 18px;margin-bottom:14px">
          <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:4px">⚠️ Severity</div>
          <div style="color:#334155">{info['severity']}</div>
        </div>
        <div style="background:#f8fafc;border-left:4px solid #059669;border-radius:6px;padding:14px 18px;margin-bottom:14px">
          <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:4px">🦠 Cause</div>
          <div style="color:#334155">{info['cause']}</div>
        </div>
        <div style="background:#f8fafc;border-left:4px solid #059669;border-radius:6px;padding:14px 18px;margin-bottom:14px">
          <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:4px">🔍 Symptoms</div>
          <div style="color:#334155">{info['symptoms']}</div>
        </div>
        <div style="background:#f8fafc;border-left:4px solid #059669;border-radius:6px;padding:14px 18px;margin-bottom:14px">
          <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:4px">💊 Treatment</div>
          <div style="color:#334155">{info['treatment']}</div>
        </div>
        <div style="background:#f8fafc;border-left:4px solid #059669;border-radius:6px;padding:14px 18px;margin-bottom:24px">
          <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:4px">🛡️ Prevention</div>
          <div style="color:#334155">{info['prevention']}</div>
        </div>
        <p style="font-size:.75rem;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px">PlantGuard AI — AI-generated report. Verify with an agronomist for critical decisions.</p>
      </div>
    </div>
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"PlantGuard AI Report – {name}"
        msg["From"] = SMTP_EMAIL
        msg["To"] = email
        msg.attach(MIMEText(html_body, "html"))
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
            s.login(SMTP_EMAIL, SMTP_PASSWORD)
            s.sendmail(SMTP_EMAIL, email, msg.as_string())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
    return {"message": "Report sent"}


@app.get("/report")
def report(disease: str):
    info = get_disease_info(disease)
    return {"report": build_report(info), "info": info}
