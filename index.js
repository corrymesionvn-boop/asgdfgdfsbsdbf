const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// Giữ Render luôn chạy
app.get('/', (req, res) => res.send('Bot Discord IDX đang Live!'));
app.listen(port, '0.0.0.0', () => console.log(`Server listening on port ${port}`));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Lấy biến từ mục Environment trên Render
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;
const HF_TRIGGER_URL = "https://corrymesion-jduxyds.hf.space/trigger";

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!keep') {
        const reply = await message.reply("⏳ Đang gửi tín hiệu kích hoạt tới Hugging Face...");

        try {
            // Gửi request POST kèm Token xác thực cho Space Private
            const response = await axios.post(HF_TRIGGER_URL, {}, {
                headers: { 
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000 // Chờ 15 giây
            });

            if (response.status === 200) {
                // Đọc tin nhắn từ Hugging Face gửi về
                const msg = response.data.message || "Worker đã bắt đầu!";
                await reply.edit(`🚀 **Thành công!**\n💬 Phản hồi: \`${msg}\`\n📸 Trình duyệt đang mở IDX và chụp ảnh màn hình...`);
            }
        } catch (error) {
            console.error("Lỗi kết nối chi tiết:", error.message);
            let errorMessage = "Không thể kết nối tới Hugging Face.";
            
            if (error.response) {
                // Lỗi từ phía Server (401, 404, 405, 500)
                errorMessage = `Mã lỗi ${error.response.status}: ${JSON.stringify(error.response.data)}`;
            } else if (error.request) {
                // Lỗi không phản hồi
                errorMessage = "Hugging Face không phản hồi (Timeout).";
            }

            await reply.edit(`❌ **Lỗi:** ${errorMessage}\n👉 Kiểm tra lại HF_TOKEN và link Space!`);
        }
    }
});

client.login(DISCORD_TOKEN).catch(err => console.error("Lỗi Login Discord:", err.message));
