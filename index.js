const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const axios = require('axios');
const app = express();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
// Thay link này bằng link Space thực tế của bạn
const HF_TRIGGER_URL = "https://corrymesion-jduxyds.hf.space/trigger";

// --- TRANG WEB ĐỂ TREO RENDER ---
app.get('/', (req, res) => {
    res.send(`<body style="background:#121212;color:white;text-align:center;padding-top:50px;font-family:sans-serif;">
        <h1>🤖 Bot Discord & IDX Controller</h1>
        <p>Bot đang online trên Render 24/7</p>
        <form action="/web-trigger" method="get">
            <button style="padding:15px 30px;background:#238636;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">
                🚀 KHỞI ĐỘNG IDX (WEB)
            </button>
        </form>
    </body>`);
});

app.get('/web-trigger', async (req, res) => {
    try {
        await axios.get(`${HF_TRIGGER_URL}?user=Admin_Web`);
        res.send("<h1>✅ Đã gọi Hugging Face!</h1><a href='/'>Quay lại</a>");
    } catch (e) { res.status(500).send("❌ Lỗi kết nối HF"); }
});

app.listen(process.env.PORT || 3000);

// --- DISCORD BOT ---
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', async (message) => {
    if (message.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_refresh')
                .setLabel('🚀 Khởi động / Làm mới IDX')
                .setStyle(ButtonStyle.Primary),
        );
        await message.reply({ content: 'Nhấn nút để kích hoạt Hugging Face (Treo 8 phút):', components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'btn_refresh') {
        const userName = interaction.user.username;
        await interaction.reply(`⏳ Đang báo cho Hugging Face kích hoạt cho **${userName}**...`);
        try {
            // Gửi request kèm tên người dùng
            await axios.get(`${HF_TRIGGER_URL}?user=${userName}`);
            await interaction.editReply(`✅ **Thành công!** Lệnh đã gửi, Hugging Face đang vào IDX và sẽ treo trong 8 phút.`);
        } catch (e) {
            await interaction.editReply(`❌ Lỗi: Hugging Face không phản hồi (Mã lỗi: ${e.response?.status || 'Unknown'}).`);
        }
    }
});

client.login(DISCORD_TOKEN);
