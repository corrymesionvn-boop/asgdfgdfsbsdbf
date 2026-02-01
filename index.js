const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot IDX Live!'));
app.listen(port, '0.0.0.0', () => console.log(`Server live on port ${port}`));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;
const HF_TRIGGER_URL = "https://corrymesion-jduxyds.hf.space/trigger";

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.content !== '!keep') return;

    const reply = await message.reply("⏳ Đang gửi lệnh tới Hugging Face...");

    try {
        const response = await axios.post(HF_TRIGGER_URL, {}, {
            headers: { 
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 25000 
        });

        if (response.status === 200) {
            await reply.edit("🚀 **Thành công!** IDX đang được treo trong 8 phút.");
        }
    } catch (error) {
        let msg = "Lỗi kết nối.";
        if (error.response) msg = `Mã lỗi ${error.response.status}`;
        await reply.edit(`❌ **Thất bại:** ${msg}`);
    }
});

client.login(DISCORD_TOKEN).catch(err => console.error("Login Fail:", err.message));
