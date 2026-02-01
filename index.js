const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const axios = require('axios');
const app = express();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
// Link Space của bạn (không được thừa dấu cách)
const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";

app.get('/', (req, res) => res.send("Bot Controller is Online"));
app.listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', async (msg) => {
    if (msg.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('idx_btn').setLabel('🚀 Khởi động / Làm mới IDX').setStyle(ButtonStyle.Success),
        );
        await msg.reply({ content: 'Nhấn để treo IDX 8 phút:', components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    // QUAN TRỌNG: Báo cho Discord bot đang làm việc (Tránh lỗi Interaction Failed)
    await interaction.deferReply({ ephemeral: true });

    try {
        const response = await axios.get(`${HF_URL}?user=${interaction.user.username}`, { timeout: 10000 });
        
        if (response.status === 200) {
            await interaction.editReply(`✅ **Thành công!** HF đã nhận lệnh. Đang treo IDX 8 phút cho **${interaction.user.username}**.`);
        }
    } catch (e) {
        console.error("Lỗi kết nối:", e.message);
        await interaction.editReply(`❌ **Lỗi:** Render không gọi được HF. Hãy kiểm tra xem Space HF có đang 'Running' không.`);
    }
});

client.login(DISCORD_TOKEN);
