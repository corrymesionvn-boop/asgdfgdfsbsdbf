const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const axios = require('axios');
const express = require('express');

// --- 1. MỞ PORT ĐỂ RENDER KHÔNG STOP BOT ---
const app = express();
app.get('/', (req, res) => res.send('Bot Discord is Running!'));
app.listen(process.env.PORT || 3000);

// --- 2. CẤU HÌNH BOT ---
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// Link Space của bạn (Đảm bảo không thừa dấu / ở cuối trigger)
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
        
        // Kiểm tra thời gian chờ 8 phút
        if (now - lastUsed < COOLDOWN_TIME) {
            const timeLeft = Math.ceil((lastUsed + COOLDOWN_TIME - now) / 1000);
            return interaction.reply({ 
                content: `⚠️ Hệ thống đang trong chu kỳ treo! Vui lòng đợi thêm **${timeLeft} giây** nữa.`, 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        // BƯỚC 1: Trả lời ngay lập tức để tránh lỗi Unknown Interaction (10062)
        await interaction.reply({ content: `⏳ Đang gửi yêu cầu tới Hugging Face, vui lòng đợi...` });

        try {
            // BƯỚC 2: Gọi API sang Space kèm Token từ Environment Variables
            await axios.get(HF_URL, {
                params: {
                    token: process.env.HF_TOKEN, // Lấy hf_qiPo... từ Render
                    user: interaction.user.username
                },
                timeout: 30000 // Chờ tối đa 30s
            });
            
            lastUsed = now;
            
            // BƯỚC 3: Cập nhật thông báo khi thành công
            await interaction.editReply({ 
                content: `🚀 **${interaction.user.username}** đã **Khởi động/Làm mới IDX** thành công! Hệ thống sẽ treo trong 8 phút.` 
            });

            // Gửi thông báo nhắc nhở sau khi hết 8 phút
            setTimeout(() => {
                interaction.channel.send(`🔔 **8 phút đã trôi qua!** Mời **${interaction.user.username}** hoặc mọi người nhấn nút để làm mới IDX.`);
            }, COOLDOWN_TIME);

        } catch (error) {
            console.error("Chi tiết lỗi:", error.response ? error.response.status : error.message);
            const status = error.response ? error.response.status : "Kết nối";
            await interaction.editReply({ 
                content: `❌ Lỗi ${status}: Không thể gọi tới Space. Vui lòng kiểm tra lại HF_TOKEN trên Render!` 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
