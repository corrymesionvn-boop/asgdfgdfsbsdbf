const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const axios = require('axios');
const express = require('express');

// 1. SERVER GIỮ SỐNG BOT
const app = express();
app.get('/', (req, res) => res.send('Bot is Online!'));
app.listen(process.env.PORT || 3000);

// 2. KHỞI TẠO CLIENT
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// 3. THÔNG SỐ CẤU HÌNH
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

        await message.reply({ 
            content: 'Hệ thống treo IDX sẵn sàng:', 
            components: [row] 
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        const now = Date.now();
        
        if (now - lastUsed < COOLDOWN_TIME) {
            const timeLeft = Math.ceil((lastUsed + COOLDOWN_TIME - now) / 1000);
            return interaction.reply({ 
                content: `⚠️ Đợi ${timeLeft}s`, 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        await interaction.reply({ content: '⏳ Đang thực hiện lệnh ping tới web /trigger...' });

        try {
            // Lấy token từ Environment trên Render
            const token = process.env.HF_TOKEN; 

            const response = await axios.get(HF_URL, {
                params: {
                    token: token,
                    user: interaction.user.username
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 30000
            });

            lastUsed = now;
            await interaction.editReply(`✅ **Kết quả:** ${response.data}`);

        } catch (error) {
            console.error("Lỗi:");
            await interaction.editReply(`❌ Lỗi ping: Space đang tắt hoặc sai cấu hình Token!`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
