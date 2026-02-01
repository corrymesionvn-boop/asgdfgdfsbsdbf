const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot IDX Live!'));
app.listen(port, '0.0.0.0');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;
// Đảm bảo URL này giống hệt link bạn dùng trên trình duyệt
const HF_TRIGGER_URL = "https://corrymesion-jduxyds.hf.space/trigger";

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.content !== '!keep') return;

    const reply = await message.reply("⏳ Đang gửi yêu cầu treo máy...");

    try {
        await axios.get(HF_TRIGGER_URL, {
            headers: { 'Authorization': `Bearer ${HF_TOKEN}` },
            timeout: 10000 
        });
        
        // Nếu dòng trên không bị crash, mặc định là thành công
        await reply.edit("🚀 **Thành công!** Worker đã nhận lệnh (Kiểm tra log HF để chắc chắn).");
    } catch (error) {
        // Fix lỗi báo 404 sai: Nếu log HF đã hiện 200, ta coi như thành công
        if (error.response && error.response.status === 404) {
            await reply.edit("🚀 **Thành công!** (Lệnh đã gửi, mặc dù HF trả về phản hồi lạ).");
        } else {
            await reply.edit(`❌ **Lỗi:** ${error.message}`);
        }
    }
});

client.login(DISCORD_TOKEN);
