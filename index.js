const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

// Khởi tạo server để Render không bị tắt bot
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
        // TÍNH NĂNG: Xóa tin nhắn cũ của bot để bảng điều khiển luôn ở dưới cùng
        try {
            const fetchedMessages = await message.channel.messages.fetch({ limit: 15 });
            const botMessages = fetchedMessages.filter(m => m.author.id === client.user.id);
            if (botMessages.size > 0) {
                await message.channel.bulkDelete(botMessages).catch(() => {});
            }
        } catch (err) {
            console.log("Không thể dọn dẹp tin nhắn cũ.");
        }

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

        // BƯỚC QUAN TRỌNG: deferReply để tránh lỗi "Unknown Interaction" (Fix lỗi 3s)
        await interaction.deferReply(); 

        try {
            // Lấy token từ biến môi trường Render đã cài đặt
            const hfToken = process.env.HF_TOKEN; 
            
            // Thực hiện ping tới Hugging Face với Token và User
            const response = await axios.get(HF_URL, {
                params: { 
                    token: hfToken, 
                    user: interaction.user.username 
                },
                timeout: 30000 // Chờ tối đa 30s
            });
            
            // Nếu thành công (nhận được chữ SUCCESS)
            if (response.data.toString().includes("SUCCESS")) {
                cooldownEnd = Date.now() + (8 * 60 * 1000); // Khóa nút 8 phút
                await interaction.editReply({ content: `✅ **Xác nhận từ Space:** ${response.data}` });
            } else {
                // Nếu nhận được nội dung lỗi (ví dụ lỗi "Oops")
                throw new Error(response.data);
            }

        } catch (error) {
            // Nếu lỗi, mở lại nút ngay để người dùng có thể thử lại
            cooldownEnd = 0; 

            let detailError = "";
            if (error.response) {
                // Fix lỗi 2000 ký tự: Chỉ lấy mã lỗi HTTP nếu HF trả về trang HTML dài
                detailError = `Hugging Face báo lỗi HTTP ${error.response.status}`;
            } else {
                detailError = error.message;
            }

            // Thông báo lỗi đúng yêu cầu của bạn
            await interaction.editReply({ 
                content: `⚠️ **Hiện tại không thể truy cập được IDX, hãy báo cáo với chủ Server để được giải quyết.**\n*(Chi tiết: ${detailError})*` 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
