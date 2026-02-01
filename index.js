const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const axios = require('axios');
const app = express();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
// Endpoint trigger của Hugging Face
const HF_TRIGGER_URL = "https://corrymesion-jduxyds.hf.space/trigger";

// --- WEB INTERFACE (Để Render không bị ngủ & Nút bấm Web) ---
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#0d1117; color:white; text-align:center; font-family:sans-serif; padding-top:80px;">
            <h1 style="color:#5865F2;">🤖 IDX Bot Controller</h1>
            <p>Bot đang chạy trên Render (24/7)</p>
            <hr style="width:50%; border:0.5px solid #30363d; margin:30px auto;">
            <form action="/web-trigger" method="get">
                <button style="background:#238636; color:white; border:none; padding:18px 35px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px;">
                    🚀 KÍCH HOẠT IDX (HUGGING FACE)
                </button>
            </form>
        </body>
    `);
});

app.get('/web-trigger', async (req, res) => {
    try {
        await axios.get(`${HF_TRIGGER_URL}?user=Admin_Web_Render`);
        res.send("<div style='text-align:center; padding-top:50px;'><h1>✅ Đã gọi Hugging Face!</h1><p>Hệ thống sẽ chạy trong 8 phút. Xem log tại HF.</p><a href='/'>Quay lại</a></div>");
    } catch (e) {
        res.status(500).send("<h1>❌ Lỗi: HF không phản hồi</h1><a href='/'>Quay lại</a>");
    }
});

app.listen(process.env.PORT || 3000, () => console.log('🌐 Web Monitor is active'));

// --- DISCORD BOT LOGIC ---
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', async (message) => {
    if (message.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_idx_refresh')
                .setLabel('🚀 Khởi động / Làm mới IDX')
                .setStyle(ButtonStyle.Primary),
        );
        await message.reply({ content: 'Nhấn nút để Hugging Face treo IDX trong 8 phút:', components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'btn_idx_refresh') {
        const userName = interaction.user.username;
        await interaction.reply(`⏳ Đang báo cho Hugging Face kích hoạt cho **${userName}**...`);
        try {
            // Gọi sang endpoint /trigger
            await axios.get(`${HF_TRIGGER_URL}?user=${userName}`);
            await interaction.editReply(`✅ **${userName}** đã kích hoạt thành công! HF đang treo IDX (8 phút). Trình duyệt sẽ tự tắt sau đó.`);
        } catch (e) {
            await interaction.editReply("❌ Lỗi: Không thể kết nối tới Hugging Face Space.");
        }
    }
});

client.login(DISCORD_TOKEN);
