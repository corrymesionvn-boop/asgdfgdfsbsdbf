const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

// Khởi tạo Express để giữ Render không tắt Bot
const app = express();
app.get('/', (req, res) => res.send('Bot IDX is Running!'));
app.listen(process.env.PORT || 3000);

// Cấu hình Client với đầy đủ quyền đọc tin nhắn
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ] 
});

// Lệnh tạo nút bấm
client.on('messageCreate', async (message) => {
    if (message.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_idx')
                .setLabel('Khởi động Treo IDX (8 Phút)')
                .setStyle(ButtonStyle.Success)
        );
        await message.reply({ 
            content: '💻 **Hệ thống điều khiển treo máy:**\nNhấn nút bên dưới để bắt đầu phiên làm việc 8 phút.', 
            components: [row] 
        });
    }
});

// Xử lý khi nhấn nút
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        // 1. Thông báo tên người kích hoạt (Không dùng @everyone)
        await interaction.reply({ 
            content: `✨ Người dùng **${interaction.user.username}** đã kích hoạt một phiên treo máy 8 phút!` 
        });

        try {
            const hfToken = process.env.HF_TOKEN; // Lấy từ Environment của Render
            const response = await axios.get("https://corrymesion-jduxyds.hf.space/trigger", {
                params: { 
                    token: hfToken, 
                    user: interaction.user.username 
                }
            });
            
            // 2. Phản hồi riêng xác nhận từ Space
            await interaction.followUp({ 
                content: `✅ **Hệ thống xác nhận:** ${response.data}`, 
                ephemeral: true 
            });
        } catch (error) {
            await interaction.followUp({ 
                content: `❌ Lỗi: Không thể kết nối tới Space. Hãy kiểm tra trạng thái Running!`, 
                ephemeral: true 
            });
        }
    }
});

// Đăng nhập Bot
client.login(process.env.DISCORD_TOKEN);
