const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot Online'));
app.listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    
    await interaction.reply({ content: '⏳ Đang ping tới Space...' });

    try {
        // GitHub sẽ KHÔNG CHẶN dòng này vì nó không chứa mã token thật
        const tokenHienTai = process.env.HF_TOKEN; 

        const response = await axios.get(HF_URL, {
            params: { 
                token: tokenHienTai, 
                user: interaction.user.username 
            },
            headers: { 'Authorization': `Bearer ${tokenHienTai}` }, // Mở khóa Private Space
            timeout: 30000
        });
        await interaction.editReply(`✅ **Kết quả:** ${response.data}`);
    } catch (error) {
        await interaction.editReply(`❌ Lỗi: ${error.message}. Kiểm tra Token trên Render!`);
    }
});

client.login(process.env.DISCORD_TOKEN);
