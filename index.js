const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

// --- 1. MỞ PORT ĐỂ RENDER KHÔNG STOP BOT ---
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (res) => res.send('Bot Discord is Running!'));
app.listen(port, () => console.log(`Listening on port ${port}`));

// --- 2. CẤU HÌNH BOT ---
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";
const HF_TOKEN = process.env.HF_TOKEN; // Token lấy từ cài đặt Hugging Face
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
        
        // Kiểm tra 8 phút
        if (now - lastUsed < COOLDOWN_TIME) {
            const timeLeft = Math.ceil((lastUsed + COOLDOWN_TIME - now) / 1000);
            return interaction.reply({ 
                content: `⚠️ Hệ thống đang chạy! Vui lòng đợi thêm **${timeLeft} giây** nữa.`, 
                ephemeral: true 
            });
        }

        const userName = interaction.user.username;
        try {
            await interaction.deferReply();
            
            // --- 3. GỌI API KÈM TOKEN ĐỂ VƯỢT RÀO PRIVATE ---
            // Nếu Space Private, phải có Bearer Token mới gọi được /trigger
            await axios.get(`${HF_URL}?user=${encodeURIComponent(userName)}`, {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`
                }
            });
            
            lastUsed = now;
            await interaction.editReply({ 
                content: `🚀 **${userName}** đã **Khởi động/Làm mới IDX** thành công! Hệ thống sẽ treo trong 8 phút.` 
            });

            // Thông báo khi hết 8 phút
            setTimeout(() => {
                interaction.channel.send("🔔 **8 phút đã trôi qua!** Mọi người có thể nhấn nút làm mới tiếp.");
            }, COOLDOWN_TIME);

        } catch (error) {
            console.error("Lỗi kết nối HF:", error.message);
            await interaction.editReply({ 
                content: '❌ Không thể kết nối tới Space. Hãy kiểm tra Space có đang "Running" và HF_TOKEN có đúng không!' 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
