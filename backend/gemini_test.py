import os, sys, urllib.request, json, ssl
from dotenv import load_dotenv
load_dotenv()

key = os.environ.get('GEMINI_API_KEY', '')
print(f"Key length: {len(key)}")
print(f"Key preview: {key[:15]}...")

url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key={key}'
data = json.dumps({
    'system_instruction': {'parts': [{'text': 'You are a helpful assistant.'}]},
    'contents': [{'role': 'user', 'parts': [{'text': 'Say hello in one word.'}]}],
    'generationConfig': {'maxOutputTokens': 50},
}).encode()

req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
try:
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx, timeout=20) as r:
        body = r.read().decode()
        print(f"Status: {r.status}")
        print(f"Response: {body[:600]}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode()[:600]}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
