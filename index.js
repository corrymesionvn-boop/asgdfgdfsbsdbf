const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

// MỞ PORT WEB CHO RENDER
const app = express();
app.get('/', (req, res) => res.send('Bot is Live!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";
const COOLDOWN_TIME = 8 * 60 * 1000;
let lastUsed = 0;

client.on('messageCreate', async (message) => {
    if (message.content === '!idx') {
        const button = new ButtonBuilder()
            .setCustomId('trigger_idx')
            .setLabel('Khởi động/Làm mới IDX')
            .setStyle(ButtonStyle.Success);
        const row = new ActionRowBuilder().addComponents(button);
        await message.reply({ content: 'Hệ thống treo IDX sẵn sàng:', components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        const now = Date.now();
        if (now - lastUsed < COOLDOWN_TIME) {
            const timeLeft = Math.ceil((lastUsed + COOLDOWN_TIME - now) / 1000);
            return interaction.reply({ content: `⚠️ Vui lòng đợi ${timeLeft}s`, ephemeral: true });
        }

        try {
            await interaction.deferReply();
            // GỌI ĐẾN ROUTE /TRIGGER TRÊN HF
            await axios.get(`${HF_URL}?user=${encodeURIComponent(interaction.user.username)}`);
            lastUsed = now;
            await interaction.editReply(`🚀 **${interaction.user.username}** đã làm mới IDX thành công!`);
        } catch (error) {
            await interaction.editReply('❌ Kết nối thất bại. Hãy kiểm tra Space có đang ở trạng thái "Running" không!');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
