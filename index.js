const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

// Tạo web server để Render không cho bot "đi ngủ"
const app = express();
app.get('/', (req, res) => res.send('Bot Discord is Online!'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// THÔNG TIN BẢO MẬT CỦA BẠN
const HF_TOKEN = "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"; 
const HF_TRIGGER_URL = "https://corrymesion-jduxyds.hf.space/trigger";
const DISCORD_TOKEN = "MTQ2MzUwMTA4MzM1OTA1MTkxMg.GIsRxT.K2PkAE5MA4Snn5ZWVy3vCxsEU6OQ582hxc6w88";

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!keep') {
        const reply = await message.reply("⏳ Đang xác thực với Private Space...");

        try {
            // Gửi request POST kèm theo Bearer Token để vượt qua bảo mật Private
            await axios.post(HF_TRIGGER_URL, {}, {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`
                }
            });
            await reply.edit("🚀 **Thành công!** Worker đã nhận lệnh và đang treo Workspace của bạn (vps123-35343544) trong 8 phút.");
        } catch (error) {
            console.error("Lỗi kết nối:");
            if (error.response && error.response.status === 401) {
                await reply.edit("❌ **Lỗi 401:** Token Hugging Face không hợp lệ hoặc đã hết hạn.");
            } else {
                await reply.edit("❌ **Lỗi:** Không thể kết nối tới Space. Hãy chắc chắn Space đang ở trạng thái 'Running'.");
            }
        }
    }
});

client.login(DISCORD_TOKEN);
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
