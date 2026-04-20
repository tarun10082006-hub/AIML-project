import asyncio, httpx, os
from dotenv import load_dotenv
load_dotenv()

async def test():
    key = os.environ.get('GROQ_API_KEY', '').strip()
    print(f"Key length: {len(key)}")
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Say hello in one word."}
    ]
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"model": "llama-3.3-70b-versatile", "messages": messages, "max_tokens": 20},
        )
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text[:500]}")

asyncio.run(test())
