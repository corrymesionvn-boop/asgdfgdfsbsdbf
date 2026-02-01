const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is Live!'));
app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Lấy thông tin từ Environment Variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;
const HF_TRIGGER_URL = "https://corrymesion-jduxyds.hf.space/trigger";

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content === '!keep') {
        const reply = await message.reply("⏳ Đang kích hoạt Private Space...");
        try {
            await axios.post(HF_TRIGGER_URL, {}, {
                headers: { 'Authorization': `Bearer ${HF_TOKEN}` }
            });
            await reply.edit("🚀 **Thành công!** Đã gửi lệnh tới Hugging Face.");
        } catch (error) {
            await reply.edit("❌ **Lỗi:** Không thể kết nối. Kiểm tra lại Env Var hoặc trạng thái Space.");
        }
    }
});

client.login(DISCORD_TOKEN).catch(err => console.error("Login Error:", err.message));
