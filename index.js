const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// Giữ cho Render không tắt Bot
app.get('/', (req, res) => res.send('Bot Discord IDX đang chạy!'));
app.listen(port, '0.0.0.0', () => console.log(`Server live on port ${port}`));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Lấy thông tin từ mục Environment trên Render
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;
// URL CHUẨN: Đảm bảo có đuôi /trigger
const HF_TRIGGER_URL = "https://corrymesion-jduxyds.hf.space/trigger";

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!keep') {
        const reply = await message.reply("⏳ Đang gửi yêu cầu kích hoạt tới Hugging Face...");

        try {
            // Gửi request POST kèm Token xác thực
            const response = await axios.post(HF_TRIGGER_URL, {}, {
                headers: { 
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // Chờ tối đa 10s
            });

            if (response.status === 200) {
                await reply.edit("🚀 **Thành công!** Worker đã được kích hoạt và đang treo IDX của bạn.");
            }
        } catch (error) {
            console.error("Lỗi kết nối:");
            let errorDetail = error.message;
            if (error.response) {
                errorDetail = `Mã lỗi ${error.response.status}: ${error.response.data.message || 'Server từ chối'}`;
            }
            await reply.edit(`❌ **Lỗi kết nối:** ${errorDetail}\n*Vui lòng kiểm tra lại HF_TOKEN hoặc trạng thái Space!*`);
        }
    }
});

client.login(DISCORD_TOKEN).catch(err => console.error("Discord Login Error:", err.message));
