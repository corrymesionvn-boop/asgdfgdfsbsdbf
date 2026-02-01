const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

// --- TẠO SERVER GIỮ PORT CHO RENDER ---
const app = express();
app.get('/', (req, res) => res.send('Bot is Running!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// --- CẤU HÌNH LẤY TỪ BIẾN MÔI TRƯỜNG ---
const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";
const HF_TOKEN = process.env.HF_TOKEN; // Bot sẽ lấy token hf_qiPo... từ đây
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
            return interaction.reply({ content: `⚠️ Đợi ${timeLeft}s`, ephemeral: true });
        }

        // Trả lời ngay lập tức để tránh lỗi Unknown Interaction
        await interaction.reply({ content: `⏳ Đang gửi lệnh tới Space (User: **${interaction.user.username}**)...`, ephemeral: false });

        try {
            // Gửi Token qua URL theo ý bạn muốn để dễ test
            await axios.get(`${HF_URL}?token=${HF_TOKEN}&user=${encodeURIComponent(interaction.user.username)}`, {
                timeout: 25000 
            });

            lastUsed = now;
            await interaction.editReply(`✅ **${interaction.user.username}** đã làm mới IDX thành công!`);

            // Thông báo nhắc nhở sau 8 phút
            setTimeout(() => {
                interaction.channel.send("🔔 **Hết 8 phút!** IDX đã hoàn thành chu kỳ, bạn có thể nhấn làm mới tiếp.");
            }, COOLDOWN_TIME);

        } catch (error) {
            console.error("Lỗi:", error.message);
            await interaction.editReply(`❌ Không thể kết nối tới Space. Lỗi: ${error.message}`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
