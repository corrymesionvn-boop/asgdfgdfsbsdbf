const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const axios = require('axios');
const app = express();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";

// --- TẠO WEB ĐỂ TREO BOT 24/7 ---
app.get('/', (req, res) => {
    res.send('<h1 style="text-align:center;">🤖 Bot đang online! Dán link này vào UptimeRobot để treo 24/7.</h1>');
});
app.listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', async (msg) => {
    if (msg.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_run').setLabel('🚀 Kích hoạt / Treo lại IDX').setStyle(ButtonStyle.Primary),
        );
        await msg.reply({ content: 'Hệ thống treo IDX (8 phút). Nhấn nút bên dưới:', components: [row] });
    }
});

client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;

    // Báo Discord đợi phản hồi từ HF
    await i.deferReply({ ephemeral: true });

    try {
        // Gửi lệnh "nhấn chuông" sang HF
        const response = await axios.get(`${HF_URL}?user=${i.user.username}`, { timeout: 15000 });
        
        if (response.status === 200) {
            await i.editReply(`✅ **Thành công!** Hugging Face đã nhận lệnh từ **${i.user.username}**.`);
        }
    } catch (e) {
        console.error(e.message);
        await i.editReply(`❌ **Lỗi:** Không thể gọi Hugging Face. Hãy kiểm tra tab Logs bên HF.`);
    }
});

client.login(DISCORD_TOKEN);
