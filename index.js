const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot IDX Live!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

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

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        // Thông báo tên người dùng công khai nhưng KHÔNG ping everyone
        await interaction.reply({ 
            content: `✨ Người dùng **${interaction.user.username}** vừa kích hoạt một phiên treo máy 8 phút!` 
        });

        try {
            const hfToken = process.env.HF_TOKEN;
            const response = await axios.get("https://corrymesion-jduxyds.hf.space/trigger", {
                params: { 
                    token: hfToken, 
                    user: interaction.user.username 
                }
            });
            
            // Gửi phản hồi xác nhận riêng cho người bấm (chỉ họ thấy)
            await interaction.followUp({ 
                content: `✅ **Lệnh đã được gửi:** ${response.data}`, 
                ephemeral: true 
            });
        } catch (error) {
            await interaction.followUp({ 
                content: `❌ Lỗi: Không thể kết nối tới máy chủ Hugging Face.`, 
                ephemeral: true 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
