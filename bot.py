import discord
from discord.ext import commands
import aiohttp
import asyncio
import os
from flask import Flask
from threading import Thread

# --- 1. WEB SERVER GIẢ LẬP ĐỂ FIX LỖI PORT TRÊN RENDER ---
web_app = Flask(__name__)

@web_app.route('/')
def health_check():
    return "Bot is alive!", 200

def run_web():
    # Render thường dùng cổng 10000 mặc định cho Web Service
    port = int(os.environ.get("PORT", 10000))
    web_app.run(host='0.0.0.0', port=port)

# --- 2. CẤU HÌNH BOT DISCORD ---
TOKEN = os.environ.get('DISCORD_TOKEN')
HF_TOKEN = os.environ.get('HF_TOKEN') 
HF_URL = "https://corrymusion-asgadfgsbsdbf.hf.space/deploy"

bot = commands.Bot(command_prefix="!", intents=discord.Intents.all())

async def wake_up_private_worker(url):
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    async with aiohttp.ClientSession() as session:
        base_url = url.replace('/deploy', '')
        for i in range(3):
            try:
                # Gửi kèm Token để vào Space Private
                async with session.get(base_url, headers=headers, timeout=15) as check:
                    if check.status == 200:
                        async with session.post(url, headers=headers, timeout=300) as resp:
                            return await resp.json()
                    elif check.status == 401:
                        return {"status": "error", "message": "Sai HF_TOKEN hoặc không có quyền Read."}
            except Exception:
                pass
            await asyncio.sleep(25) 
    return {"status": "error", "message": "Space không phản hồi sau 1 phút."}

@bot.command()
async def deploy(ctx):
    await ctx.send("📡 Đang xác thực và gọi Space Private...")
    result = await wake_up_private_worker(HF_URL)
    if result.get("status") == "success":
        await ctx.send(f"✅ {result['message']}")
    else:
        await ctx.send(f"❌ {result['message']}")

@bot.event
async def on_ready():
    print(f"🚀 Bot Render đã online: {bot.user}")

# --- 3. CHẠY SONG SONG ---
if __name__ == "__main__":
    # Chạy Web Server ở luồng riêng để Render không báo lỗi Port
    t = Thread(target=run_web)
    t.daemon = True
    t.start()
    
    # Chạy Bot Discord
    try:
        bot.run(TOKEN)
    except Exception as e:
        print(f"Lỗi khởi động Bot: {e}")
