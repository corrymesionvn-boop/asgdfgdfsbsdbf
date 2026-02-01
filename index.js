const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

// --- CẤU HÌNH SERVER ĐỂ RENDER KHÔNG STOP BOT ---
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot Discord đang hoạt động!'));

app.listen(port, '0.0.0.0', () => {
    console.log(`Server đang lắng nghe tại port ${port}`);
});

// --- CẤU HÌNH DISCORD BOT ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Thông tin bạn đã cung cấp
const HF_TOKEN = "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"; 
const HF_TRIGGER_URL = "https://corrymesion-jduxyds.hf.space/trigger";
const DISCORD_TOKEN = "MTQ2MzUwMTA4MzM1OTA1MTkxMg.GIsRxT.K2PkAE5MA4Snn5ZWVy3vCxsEU6OQ582hxc6w88";

client.on('ready', () => {
    console.log(`Đã đăng nhập thành công dưới tên: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    // Không trả lời tin nhắn của bot khác
    if (message.author.bot) return;

    // Lệnh kích hoạt
    if (message.content === '!keep') {
        const reply = await message.reply("⏳ Đang gửi yêu cầu xác thực tới Private Space trên Hugging Face...");

        try {
            // Gửi request POST kèm theo Bearer Token để vượt qua lớp bảo mật Private
            const response = await axios.post(HF_TRIGGER_URL, {}, {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200 || response.status === 202) {
                await reply.edit("🚀 **Thành công!** Hugging Face đã nhận lệnh và đang treo Workspace IDX của bạn trong 8 phút.");
            }
        } catch (error) {
            console.error("Lỗi kết nối HF:", error.message);
            
            let errorMsg = "❌ **Lỗi:** Không thể kết nối tới Hugging Face.";
            if (error.response && error.response.status === 401) {
                errorMsg = "❌ **Lỗi 401:** Token Hugging Face không hợp lệ hoặc Space không cho phép truy cập.";
            } else if (error.response && error.response.status === 404) {
                errorMsg = "❌ **Lỗi 404:** Không tìm thấy URL `/trigger`. Hãy kiểm tra lại code Flask trên HF.";
            }

            await reply.edit(errorMsg);
        }
    }
});

// Đăng nhập bot
client.login(DISCORD_TOKEN).catch(err => {
    console.error("Discord Login Error:", err.message);
});
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
