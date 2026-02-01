const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const axios = require('axios');
const app = express();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN; // Lấy từ Environment Variable bạn vừa tạo
const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";

app.get('/', (req, res) => res.send('Bot Controller is Active'));
app.listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', async (msg) => {
    if (msg.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('run_idx_vfinal').setLabel('🚀 Kích hoạt Treo IDX').setStyle(ButtonStyle.Success),
        );
        await msg.reply({ content: 'Nhấn nút để bắt đầu chu kỳ 8 phút:', components: [row] });
    }
});

client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;
    try {
        await i.deferReply({ ephemeral: true }); // Phản hồi ngay để tránh lỗi 10062
        await axios.get(`${HF_URL}?user=${i.user.username}`, {
            timeout: 15000,
            headers: { 'Authorization': `Bearer ${HF_TOKEN}` }
        });
        await i.editReply(`✅ **Thành công!** Tín hiệu đã gửi tới Hugging Face.`);
    } catch (e) {
        await i.editReply(`❌ **Lỗi:** Không thể gọi HF. Check biến HF_TOKEN trên Render.`);
    }
});

client.login(DISCORD_TOKEN);
