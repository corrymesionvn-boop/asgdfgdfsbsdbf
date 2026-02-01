const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const axios = require('axios');
const app = express();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_TRIGGER_URL = "https://corrymesion-jduxyds.hf.space/trigger";

// --- TẠO GIAO DIỆN WEB CHO RENDER ---
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#0d1117; color:white; text-align:center; font-family:sans-serif; padding-top:50px;">
            <h1 style="color:#5865F2;">🤖 IDX Control Hub</h1>
            <p>Trạng thái: Đang treo bot 24/7 trên Render</p>
            <form action="/web-trigger" method="get">
                <button style="background:#238636; color:white; border:none; padding:15px 30px; border-radius:8px; cursor:pointer; font-weight:bold;">
                    🚀 BẤM ĐỂ KHỞI ĐỘNG IDX (WEB)
                </button>
            </form>
        </body>
    `);
});

// Khi nhấn nút trên Web Render
app.get('/web-trigger', async (req, res) => {
    try {
        await axios.get(`${HF_TRIGGER_URL}?user=Admin_Web`);
        res.send("<h1>✅ Đã gọi Hugging Face!</h1><a href='/'>Quay lại</a>");
    } catch (e) { res.status(500).send("❌ Lỗi gọi HF"); }
});

app.listen(process.env.PORT || 3000);

// --- CẤU HÌNH NÚT BẤM DISCORD ---
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', async (message) => {
    // Khi gõ lệnh !idx, bot sẽ hiện nút
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

// Xử lý khi có người nhấn nút trên Discord
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'btn_refresh') {
        const userName = interaction.user.username;
        await interaction.reply(`⏳ Đang báo cho Hugging Face kích hoạt cho **${userName}**...`);
        try {
            // Gửi lệnh sang cổng /trigger đã mở trên Hugging Face
            await axios.get(`${HF_TRIGGER_URL}?user=${userName}`);
            await interaction.editReply(`✅ **${userName}** đã kích hoạt thành công! HF đang vào IDX và sẽ tự thoát sau 8 phút.`);
        } catch (e) {
            await interaction.editReply("❌ Lỗi: Hugging Face không phản hồi (404 hoặc Down).");
        }
    }
});

client.login(DISCORD_TOKEN);
