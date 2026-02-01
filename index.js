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
// Biến global nằm ngoài mọi function để khóa toàn bộ Bot
let cooldownEnd = 0; 

client.on('messageCreate', async (message) => {
    if (message.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_idx')
                .setLabel('Khởi động/Refresh IDX')
                .setStyle(ButtonStyle.Success)
        );
        const responseContent = "**Khởi động/Refresh IDX:**\nBot sẽ treo Web trong 8 phút. Nút sẽ khóa trong thời gian này.";
        await message.reply({ content: responseContent, components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        const now = Date.now();

        // KIỂM TRA KHÓA: Nếu thời gian hiện tại vẫn nhỏ hơn thời gian kết thúc cooldown
        if (now < cooldownEnd) {
            const unixTimestamp = Math.floor(cooldownEnd / 1000);
            // Trả lời ngay lập tức và thoát hàm, không chạy code gọi Space bên dưới
            return await interaction.reply({ 
                content: `⏳ **Hệ thống đang bận!** Nút bấm đang bị khóa. Bạn có thể thử lại vào: <t:${unixTimestamp}:R>`, 
                ephemeral: true 
            });
        }

        // ĐẶT KHÓA NGAY LẬP TỨC: Trước khi gọi API để tránh spam nhanh
        cooldownEnd = Date.now() + (8 * 60 * 1000);

        await interaction.reply({ 
            content: `✨ Người dùng **${interaction.user.username}** đã kích hoạt treo IDX! Nút bấm đã bị khóa 8 phút.` 
        });

        try {
            const hfToken = process.env.HF_TOKEN; 
            const response = await axios.get(HF_URL, {
                params: { token: hfToken, user: interaction.user.username },
                headers: { 'Authorization': `Bearer ${hfToken}` },
                timeout: 10000 
            });
            
            await interaction.followUp({ content: `✅ **Xác nhận:** ${response.data}`, ephemeral: true });
        } catch (error) {
            // Nếu lỗi kết nối, mở khóa lại ngay để người dùng có thể thử lại
            cooldownEnd = 0; 
            await interaction.followUp({ content: `❌ Lỗi kết nối! Nút đã được mở khóa lại.`, ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
