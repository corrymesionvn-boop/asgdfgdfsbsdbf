const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot IDX Live!'));
app.listen(port, '0.0.0.0', () => console.log(`Listening on ${port}`));

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;
const HF_TRIGGER_URL = "https://corrymesion-jduxyds.hf.space/trigger";

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.content !== '!keep') return;

    const reply = await message.reply("⏳ Đang gửi yêu cầu treo máy...");

    try {
        // Gửi lệnh và chỉ cần quan tâm xem HF có nhận được không (status 200)
        const response = await axios({
            method: 'get',
            url: HF_TRIGGER_URL,
            headers: { 'Authorization': `Bearer ${HF_TOKEN}` },
            timeout: 15000
        });

        if (response.status === 200) {
            await reply.edit("🚀 **Xác nhận:** Hugging Face đã nhận lệnh thành công! Worker đang treo máy trong 8 phút.");
        }
    } catch (error) {
        // Nếu log HF của bạn đã hiện 200 mà bot vẫn báo lỗi, ta sẽ kiểm tra kỹ lỗi đó ở đây
        console.error("Lỗi:", error.message);
        
        if (error.response && error.response.status === 200) {
            await reply.edit("✅ **Thành công:** Mặc dù có lỗi hiển thị nhưng Hugging Face đã phản hồi mã 200.");
        } else {
            await reply.edit(`❌ **Lỗi:** ${error.message}. (Hãy kiểm tra tab Logs của Hugging Face để chắc chắn)`);
        }
    }
});

client.login(DISCORD_TOKEN);
