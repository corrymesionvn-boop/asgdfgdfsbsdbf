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
        try {
            const fetchedMessages = await message.channel.messages.fetch({ limit: 10 });
            const botMessages = fetchedMessages.filter(m => m.author.id === client.user.id);
            if (botMessages.size > 0) await message.channel.bulkDelete(botMessages).catch(() => {});
        } catch (err) { console.log("Không thể dọn dẹp tin nhắn cũ."); }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_idx')
                .setLabel('Khởi động/Refresh IDX')
                .setStyle(ButtonStyle.Success)
        );
        const responseContent = "🚀 **BẢNG ĐIỀU KHIỂN TREO IDX**\nNhấn nút bên dưới để bắt đầu phiên treo máy 8 phút.";
        await message.channel.send({ content: responseContent, components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        const now = Date.now();

        if (now < cooldownEnd) {
            const unixTimestamp = Math.floor(cooldownEnd / 1000);
            return await interaction.reply({ 
                content: `⏳ **Hệ thống đang bận!** Thử lại sau: <t:${unixTimestamp}:R>`, 
                ephemeral: true 
            });
        }

        // Báo cho Discord bot đang xử lý để tránh lỗi 3 giây
        await interaction.deferReply(); 

        try {
            const hfToken = process.env.HF_TOKEN; // Lấy từ Environment Variable trên Render
            
            // THỰC HIỆN PING: Tự động ghép token và user vào URL
            const response = await axios.get(HF_URL, {
                params: { 
                    token: hfToken, 
                    user: interaction.user.username 
                },
                timeout: 30000 // Tăng lên 30s để thoải mái chờ Space khởi động
            });
            
            if (response.data.toString().includes("SUCCESS")) {
                cooldownEnd = Date.now() + (8 * 60 * 1000);
                await interaction.editReply({ content: `✅ **Xác nhận từ Space:** ${response.data}` });
            } else {
                throw new Error(response.data);
            }

        } catch (error) {
            // Mở lại nút nếu có lỗi để người dùng thử lại
            cooldownEnd = 0; 

            let displayError = "";
            if (error.response) {
                // Nếu Hugging Face trả về trang HTML 404/500, chỉ lấy tiêu đề lỗi để tránh quá 2000 ký tự
                displayError = `Hugging Face báo lỗi HTTP ${error.response.status}`;
            } else {
                displayError = error.message;
            }

            // Hiển thị thông báo đúng yêu cầu của bạn
            await interaction.editReply({ 
                content: `⚠️ **Hiện tại không thể truy cập được IDX, hãy báo cáo với chủ Server để được giải quyết.**\n*(Chi tiết: ${displayError})*` 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
