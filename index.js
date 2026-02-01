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

client.on('messageCreate', async (message) => {
    if (message.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_idx')
                .setLabel('Khởi động/Refresh IDX')
                .setStyle(ButtonStyle.Success)
        );

        // Cập nhật tiêu đề và nội dung mô tả mới của bạn
        const responseContent = 
            "**Khởi động/Refresh IDX:**\n" +
            "Bot sẽ chỉ treo Web trong vòng 8 phút, sau 8 phút Bot sẽ tự rời web, tương tác nút này để Bot khởi động/refresh lại web nhé";

        await message.reply({ 
            content: responseContent, 
            components: [row] 
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        // Thông báo công khai tên người kích hoạt
        await interaction.reply({ 
            content: `✨ Người dùng **${interaction.user.username}** đã kích hoạt một phiên treo máy/refresh 8 phút!` 
        });

        try {
            const hfToken = process.env.HF_TOKEN; 
            const response = await axios.get(HF_URL, {
                params: { 
                    token: hfToken, 
                    user: interaction.user.username 
                },
                // Giữ Authorization để vào Space Private
                headers: { 'Authorization': `Bearer ${hfToken}` },
                timeout: 10000 
            });
            
            // Phản hồi riêng xác nhận kết quả từ Hugging Face
            await interaction.followUp({ 
                content: `✅ **Hệ thống xác nhận:** ${response.data}`, 
                ephemeral: true 
            });
        } catch (error) {
            await interaction.followUp({ 
                content: `❌ Lỗi: Không thể kết nối tới Space để Refresh!`, 
                ephemeral: true 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
