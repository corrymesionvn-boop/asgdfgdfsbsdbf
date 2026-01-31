import discord
from discord.ext import commands
import aiohttp
import asyncio

TOKEN = "MTQ2MzUwMTA4MzM1OTA1MTkxMg.Gs3rVN.u_QxE4-2blggtCUWpOSQV_9Ab-aGn-FpNiYmVE"
# Thay link Space của bạn vào đây (nhớ thêm /deploy ở cuối)
HF_URL = "https://corrymusion-asdad.hf.space/deploy"

bot = commands.Bot(command_prefix="!", intents=discord.Intents.all())

async def wake_up_and_deploy(url):
    # Render sẽ thử đánh thức Space trước để né 503
    async with aiohttp.ClientSession() as session:
        base_url = url.replace('/deploy', '')
        for i in range(3): # Thử lại 3 lần
            async with session.get(base_url) as check:
                if check.status == 200:
                    # Nếu Space đã tỉnh, gửi lệnh xử lý file
                    async with session.post(url) as resp:
                        return await resp.json()
            print(f"Space đang ngủ, đợi 20s... (Lần {i+1})")
            await asyncio.sleep(20)
    return {"status": "error", "message": "Space không phản hồi (503)"}

@bot.command()
async def start_vps(ctx):
    await ctx.send("📡 Đang đánh thức Hugging Face Worker...")
    result = await wake_up_and_deploy(HF_URL)
    
    if result.get("status") == "success":
        await ctx.send(f"✅ {result['message']}")
    else:
        await ctx.send(f"❌ Lỗi: {result['message']}")

@bot.event
async def on_ready():
    print(f"Bot đầu não đã online: {bot.user}")

bot.run(TOKEN)
