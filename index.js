const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const axios = require('axios');
const app = express();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
// ĐẢM BẢO LINK NÀY CHÍNH XÁC (Không có dấu cách ở cuối)
const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";

app.get('/', (req, res) => res.send("Bot is Running"));
app.listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', async (msg) => {
    if (msg.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('go').setLabel('🚀 Khởi động / Làm mới IDX').setStyle(ButtonStyle.Primary),
        );
        await msg.reply({ content: 'Nhấn để treo IDX 8 phút:', components: [row] });
    }
});

client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;
    await i.deferUpdate(); // Tránh lỗi "Interaction failed" trên Discord

    try {
        // Gửi tín hiệu kèm Header giả lập trình duyệt
        await axios.get(`${HF_URL}?user=${i.user.username}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 5000 // Chờ 5 giây
        });
        await i.followUp({ content: `✅ **Thành công!** Hugging Face đã nhận lệnh từ **${i.user.username}**.`, ephemeral: true });
    } catch (e) {
        console.log("Lỗi gửi tín hiệu:", e.message);
        await i.followUp({ content: `❌ Lỗi: Render không thể gọi Hugging Face. (Chi tiết: ${e.message})`, ephemeral: true });
    }
});

client.login(DISCORD_TOKEN);
