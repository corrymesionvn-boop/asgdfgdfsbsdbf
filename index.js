const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot Live'));
app.listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    await interaction.reply({ content: '⏳ Đang gửi lệnh ping...' });

    try {
        const token = process.env.HF_TOKEN; // Lấy từ Environment Render
        const response = await axios.get(HF_URL, {
            params: { token: token, user: interaction.user.username },
            headers: { 'Authorization': `Bearer ${token}` }
        });
        await interaction.editReply(`✅ **Kết quả:** ${response.data}`);
    } catch (error) {
        await interaction.editReply(`❌ Lỗi kết nối Space: ${error.message}`);
    }
});

client.login(process.env.DISCORD_TOKEN);
