const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot is Live!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";
const HF_TOKEN = process.env.HF_TOKEN; 
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
            // FIX: Sử dụng fetchReply để đảm bảo defer thành công
            await interaction.deferReply().catch(err => console.error("Lỗi defer:", err));

            await axios.get(`${HF_URL}?user=${encodeURIComponent(interaction.user.username)}`, {
                headers: { 'Authorization': `Bearer ${HF_TOKEN}` },
                timeout: 30000 // Chờ tối đa 30s
            });

            lastUsed = now;

            // Kiểm tra nếu interaction vẫn còn hiệu lực trước khi edit
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply(`🚀 **${interaction.user.username}** đã làm mới IDX thành công!`);
            }
        } catch (error) {
            console.error("Lỗi kết nối:", error.message);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply('❌ Kết nối tới Space thất bại. Hãy kiểm tra HF_TOKEN và trạng thái Space!');
            }
        }
    }
});

// Chặn đứng việc crash bot khi có lỗi không mong muốn
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.login(process.env.DISCORD_TOKEN);
