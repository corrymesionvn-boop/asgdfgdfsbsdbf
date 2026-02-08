const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot IDX Live!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger"; 
let cooldownEnd = 0; 

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_idx')
                .setLabel('Khởi động/Refresh IDX')
                .setStyle(ButtonStyle.Success)
        );
        await message.channel.send({ 
            content: "🚀 **BẢNG ĐIỀU KHIỂN TREO IDX**\nNhấn nút bên dưới để bắt đầu phiên treo máy 8 phút.", 
            components: [row] 
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        const now = Date.now();
        if (now < cooldownEnd) {
            const unixTimestamp = Math.floor(cooldownEnd / 1000);
            return await interaction.reply({ content: `⏳ Thử lại sau: <t:${unixTimestamp}:R>`, ephemeral: true });
        }

        // --- ĐOẠN FIX LỖI 10062 ---
        try {
            await interaction.deferReply(); 
        } catch (err) {
            console.error("Lỗi deferReply (có thể do quá 3s):", err.message);
            return; // Dừng lại vì interaction đã hết hạn
        }
        // -------------------------

        try {
            const hfToken = process.env.HF_TOKEN;
            // Gọi sang Hugging Face với tham số 'test' để khớp với main.py mới
            const response = await axios.get(HF_URL, {
                params: { token: hfToken || "test", user: interaction.user.username },
                timeout: 45000 
            });
            
            if (response.data.toString().includes("SUCCESS")) {
                cooldownEnd = Date.now() + (8 * 60 * 1000);
                await interaction.editReply({ content: `✅ **Xác nhận:** ${response.data}` });
            } else {
                throw new Error(response.data);
            }
        } catch (error) {
            const msg = error.response ? `HTTP ${error.response.status}` : error.message;
            // Sử dụng editReply vì đã gọi deferReply trước đó
            await interaction.editReply({ 
                content: `⚠️ **Lỗi kết nối tới Space.** (Chi tiết: ${msg})` 
            }).catch(() => {});
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
