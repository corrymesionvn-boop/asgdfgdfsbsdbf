const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot is Running!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

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
            return interaction.reply({ 
                content: `⚠️ Vui lòng đợi ${timeLeft}s`, 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        try {
            // FIX: Gửi tín hiệu "đang xử lý" ngay lập tức (dưới 1 giây) để tránh lỗi 10062
            await interaction.deferReply().catch(e => console.error("Lỗi defer sớm:", e.message));

            // Gọi API ngầm sang Hugging Face
            await axios.get(HF_URL, {
                params: {
                    token: HF_TOKEN,
                    user: interaction.user.username
                },
                timeout: 50000 // Tăng lên 50s vì Hugging Face khởi động lâu
            });

            lastUsed = now;
            
            // Dùng editReply vì đã gọi deferReply trước đó
            await interaction.editReply(`🚀 **${interaction.user.username}** làm mới thành công!`);

            setTimeout(() => {
                interaction.channel.send(`🔔 **8 phút đã hết!** Mời nhấn nút tiếp.`);
            }, COOLDOWN_TIME);

        } catch (error) {
            console.error("Lỗi thực thi:", error.message);
            // Kiểm tra xem đã defer chưa trước khi báo lỗi
            if (interaction.deferred) {
                await interaction.editReply(`❌ Lỗi: ${error.response ? error.response.status : 'Hết hạn chờ'}. Hãy kiểm tra log Space!`);
            }
            lastUsed = 0;
        }
    }
});

// Chống crash bot khi gặp lỗi mạng
process.on('unhandledRejection', error => console.error('Lỗi ngầm:', error));

client.login(process.env.DISCORD_TOKEN);
