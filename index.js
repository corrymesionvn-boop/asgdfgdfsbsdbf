const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
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

    const now = Date.now();
    if (now - lastUsed < COOLDOWN_TIME) {
        const timeLeft = Math.ceil((lastUsed + COOLDOWN_TIME - now) / 1000);
        return interaction.reply({ 
            content: `⚠️ Đợi ${timeLeft}s`, 
            flags: [MessageFlags.Ephemeral] // Cách viết mới thay cho ephemeral: true
        });
    }

    await interaction.reply({ content: `🚀 Đang gửi lệnh tới Space...` });

    lastUsed = now;

    // FIX LỖI 404: Đảm bảo link không bị thừa dấu xuyệt hoặc sai tham số
    axios.get(HF_URL, {
        params: {
            token: HF_TOKEN,
            user: interaction.user.username
        },
        timeout: 45000 
    })
    .then(() => {
        interaction.editReply(`✅ **${interaction.user.username}** đã làm mới IDX thành công!`);
    })
    .catch((err) => {
        console.error("Chi tiết lỗi:", err.response ? err.response.status : err.message);
        interaction.editReply(`❌ Lỗi ${err.response ? err.response.status : ''}: Vui lòng kiểm tra lại đường dẫn /trigger trên Hugging Face!`);
        lastUsed = 0;
    });
});

client.login(process.env.DISCORD_TOKEN);
