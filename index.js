const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// Giữ cho Render luôn xanh
app.get('/', (req, res) => res.send('Bot đang chạy!'));
app.listen(port, '0.0.0.0', () => console.log(`Cổng: ${port}`));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Lấy biến từ Environment trên Render
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;
// FIX 404: Đảm bảo có đuôi /trigger ở cuối URL
const HF_TRIGGER_URL = "https://corrymesion-jduxyds.hf.space/trigger";

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.content !== '!keep') return;

    const reply = await message.reply("⏳ Đang gửi yêu cầu kích hoạt...");

    try {
        const response = await axios.post(HF_TRIGGER_URL, {}, {
            headers: { 
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 25000 
        });

        if (response.status === 200) {
            await reply.edit("🚀 **Thành công!** Worker đã nhận lệnh và đang treo IDX cho bạn.");
        }
    } catch (error) {
        let msg = "Lỗi kết nối.";
        if (error.response) {
            // Nếu vẫn báo 404 ở đây, nghĩa là link HF_TRIGGER_URL bị sai tên Space
            msg = `Mã lỗi ${error.response.status}: Kiểm tra lại URL trong index.js!`;
        }
        await reply.edit(`❌ **Thất bại:** ${msg}`);
    }
});

client.login(DISCORD_TOKEN).catch(err => console.error("Lỗi Token Discord:", err.message));
