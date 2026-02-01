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

// Biến lưu thời gian hết hạn Cooldown (ms)
let cooldownEnd = 0; 

client.on('messageCreate', async (message) => {
    if (message.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_idx')
                .setLabel('Khởi động/Refresh IDX')
                .setStyle(ButtonStyle.Success)
        );

        const responseContent = 
            "**Khởi động/Refresh IDX:**\n" +
            "Bot sẽ chỉ treo Web trong vòng 8 phút, sau 8 phút Bot sẽ tự rời web. " +
            "Trong thời gian Bot đang làm việc, nút này sẽ tạm khóa.";

        await message.reply({ content: responseContent, components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        const now = Date.now();

        // Kiểm tra xem còn trong thời gian Cooldown không
        if (now < cooldownEnd) {
            const remaining = Math.ceil((cooldownEnd - now) / 60000); // Đổi sang phút
            return await interaction.reply({ 
                content: `⏳ **Bot đang bận treo máy!** Vui lòng đợi thêm khoảng **${remaining} phút** nữa để có thể Refresh lại.`, 
                ephemeral: true 
            });
        }

        // Nếu hết Cooldown, bắt đầu tiến trình mới
        await interaction.reply({ 
            content: `✨ Người dùng **${interaction.user.username}** đã kích hoạt treo IDX! Hệ thống sẽ khóa nút trong 8 phút.` 
        });

        try {
            // Thiết lập Cooldown 8 phút (8 * 60 * 1000 ms)
            cooldownEnd = Date.now() + (8 * 60 * 1000); 

            const hfToken = process.env.HF_TOKEN; 
            const response = await axios.get(HF_URL, {
                params: { token: hfToken, user: interaction.user.username },
                headers: { 'Authorization': `Bearer ${hfToken}` },
                timeout: 10000 
            });
            
            await interaction.followUp({ 
                content: `✅ **Xác nhận:** ${response.data}\n⏱️ Cooldown đã được kích hoạt.`, 
                ephemeral: true 
            });
        } catch (error) {
            // Nếu lỗi kết nối, reset cooldown để người dùng có thể thử lại ngay
            cooldownEnd = 0; 
            await interaction.followUp({ 
                content: `❌ Lỗi kết nối Space! Nút đã được mở lại để bạn thử lại.`, 
                ephemeral: true 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
