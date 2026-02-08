const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

// Khởi tạo web server để Render không stop bot
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
        // TÍNH NĂNG: Tự động dọn dẹp tin nhắn cũ của bot
        try {
            const fetched = await message.channel.messages.fetch({ limit: 10 });
            const botMsgs = fetched.filter(m => m.author.id === client.user.id);
            if (botMsgs.size > 0) await message.channel.bulkDelete(botMsgs).catch(() => {});
        } catch (e) { console.log("Không thể dọn dẹp tin nhắn cũ."); }

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

        // Kiểm tra Cooldown
        if (now < cooldownEnd) {
            const unixTimestamp = Math.floor(cooldownEnd / 1000);
            return await interaction.reply({ 
                content: `⏳ **Hệ thống đang bận!** Thử lại sau: <t:${unixTimestamp}:R>`, 
                ephemeral: true 
            });
        }

        // Bước quan trọng: deferReply để kéo dài thời gian chờ quá 3 giây
        await interaction.deferReply(); 

        try {
            // Lấy token từ Environment Variable 'HF_TOKEN' trên Render
            const hfToken = process.env.HF_TOKEN; 
            
            // THỰC HIỆN GỌI LINK (Y hệt cách bạn mở trình duyệt)
            // Axios sẽ tự ghép thành: https://corrymesion-jduxyds.hf.space/trigger?token=...&user=...
            const response = await axios.get(HF_URL, {
                params: { 
                    token: hfToken, 
                    user: interaction.user.username 
                },
                timeout: 30000 // Chờ 30 giây
            });
            
            // Kiểm tra phản hồi từ Hugging Face
            if (response.data.toString().includes("SUCCESS")) {
                cooldownEnd = Date.now() + (8 * 60 * 1000); // Khóa 8 phút
                await interaction.editReply({ content: `✅ **Xác nhận từ Space:** ${response.data}` });
            } else {
                throw new Error(response.data);
            }

        } catch (error) {
            // Mở lại nút nếu có lỗi để người dùng thử lại
            cooldownEnd = 0; 

            let detail = "";
            if (error.response) {
                // Nếu bị 404/500, chỉ lấy status code để không bị lỗi 2000 ký tự Discord
                detail = `Hugging Face báo lỗi HTTP ${error.response.status}`;
            } else {
                detail = error.message;
            }

            // Gửi thông báo lỗi theo yêu cầu của bạn
            await interaction.editReply({ 
                content: `⚠️ **Hiện tại không thể truy cập được IDX, hãy báo cáo với chủ Server để được giải quyết.**\n*(Chi tiết: ${detail})*` 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
