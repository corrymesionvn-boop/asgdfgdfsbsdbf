import discord
from discord.ext import commands
import aiohttp
import asyncio
import os

# Lấy Token từ Environment Variables của Render
TOKEN = os.environ.get('DISCORD_TOKEN')
# Thay link này bằng link Space của bạn (nhìn trong hình image_e6453a.png của bạn)
HF_URL = "https://corrymusion-asdadasdasdasd.hf.space/deploy"

bot = commands.Bot(command_prefix="!", intents=discord.Intents.all())

async def wake_up_worker(url):
    """Hàm đánh thức Space và gửi lệnh POST"""
    async with aiohttp.ClientSession() as session:
        # 1. Gửi lệnh GET để đánh thức Space (né lỗi 503)
        base_url = url.replace('/deploy', '')
        for i in range(3):
            try:
                async with session.get(base_url, timeout=10) as check:
                    if check.status == 200:
                        # 2. Nếu Space đã online, gửi lệnh POST giải nén
                        async with session.post(url, timeout=300) as resp:
                            return await resp.json()
            except:
                pass
            print(f"Đang đợi Space khởi động... thử lại lần {i+1}")
            await asyncio.sleep(25) # Đợi Space boot up
    return {"status": "error", "message": "Space không phản hồi sau 1 phút."}

@bot.command()
async def deploy(ctx):
    await ctx.send("📡 Đang kết nối với Hugging Face Worker (vui lòng đợi)...")
    result = await wake_up_worker(HF_URL)
    
    if result.get("status") == "success":
        await ctx.send(f"✅ Thành công: {result['message']}")
    else:
        await ctx.send(f"❌ Lỗi: {result['message']}")

@bot.event
async def on_ready():
    print(f"🚀 Bot điều khiển đã online: {bot.user}")

bot.run(TOKEN)
