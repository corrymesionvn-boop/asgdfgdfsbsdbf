const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const axios = require('axios');
const app = express();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";

app.get('/', (req, res) => {
    res.send(`<body style="background:#1a1a1a;color:white;text-align:center;padding-top:50px;">
        <h1>🤖 Controller Online</h1>
        <form action="/web-trigger" method="get">
            <button style="padding:15px;background:green;color:white;cursor:pointer;">🚀 KÍCH HOẠT IDX</button>
        </form>
    </body>`);
});

app.get('/web-trigger', async (req, res) => {
    await axios.get(`${HF_URL}?user=Admin_Web`);
    res.send("✅ OK!");
});

app.listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', async (msg) => {
    if (msg.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn').setLabel('🚀 Khởi động / Làm mới IDX').setStyle(ButtonStyle.Primary),
        );
        await msg.reply({ content: 'Bấm để treo IDX 8 phút:', components: [row] });
    }
});

client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;
    await i.reply(`⏳ Đang báo cho Hugging Face...`);
    try {
        // Gọi sang HF kèm tên người bấm
        await axios.get(`${HF_URL}?user=${i.user.username}`);
        await i.editReply(`✅ **Thành công!** Hugging Face đang xử lý. Browser sẽ tự tắt sau 8 phút.`);
    } catch (e) {
        await i.editReply(`❌ Lỗi: HF không phản hồi kịp (nhưng lệnh có thể đã gửi).`);
    }
});

client.login(DISCORD_TOKEN);
