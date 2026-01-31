import discord
from discord.ext import commands
import aiohttp
import asyncio
import os
from flask import Flask
from threading import Thread

# --- WEB SERVER GIỮ PORT RENDER (Né lỗi 503 của Render) ---
web_app = Flask(__name__)
@web_app.route('/')
def health(): return "Bot Render is Alive", 200

def run_web():
    port = int(os.environ.get("PORT", 10000))
    web_app.run(host='0.0.0.0', port=port)

# --- BOT DISCORD ---
TOKEN = os.environ.get('DISCORD_TOKEN')
HF_TOKEN = os.environ.get('HF_TOKEN')
HF_URL = "https://corrymusion-asgadfgsbsdbf.hf.space/deploy"

bot = commands.Bot(command_prefix="!", intents=discord.Intents.all())

async def call_worker(url):
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    async with aiohttp.ClientSession() as session:
        base_url = url.replace('/deploy', '')
        for i in range(3):
            try:
                async with session.get(base_url, headers=headers, timeout=15) as check:
                    if check.status == 200:
                        async with session.post(url, headers=headers, timeout=300) as resp:
                            return await resp.json()
            except: pass
            await asyncio.sleep(30)
    return {"status": "error", "message": "Space không phản hồi sau khi thử lại."}

@bot.command()
async def deploy(ctx):
    await ctx.send("📡 **Đang xử lý session từ Drive sang Space...**")
    result = await call_worker(HF_URL)
    
    if result.get("status") == "success":
        # Gửi thông báo kèm ảnh Thành công
        embed = discord.Embed(title="✅ HOÀN TẤT GIẢI NÉN", description=result['message'], color=0x00ff00)
        embed.set_image(url="https://i.imgur.com/8f6B2Gk.png") # Ảnh tích xanh thành công
        await ctx.send(embed=embed)
    else:
        # Gửi thông báo kèm ảnh Lỗi
        embed = discord.Embed(title="❌ LỖI HỆ THỐNG", description=result['message'], color=0xff0000)
        embed.set_image(url="https://i.imgur.com/G3S3u5E.png") # Ảnh dấu X đỏ lỗi
        await ctx.send(embed=embed)

if __name__ == "__main__":
    Thread(target=run_web, daemon=True).start()
    bot.run(TOKEN)
