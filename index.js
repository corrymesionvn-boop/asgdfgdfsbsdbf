const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

// Khởi tạo server để Render giữ bot luôn sống
const app = express();
app.get('/', (req, res) => res.send('Bot IDX Live!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger"; 
let cooldownEnd = 0; 

client.on('messageCreate', async (message) => {
    // Không phản hồi bot
    if (message.author.bot) return;

    if (message.content === '!idx') {
        // TÍNH NĂNG: Xóa các tin nhắn cũ của bot trong channel để bảng điều khiển luôn ở dưới cùng
        try {
            const fetchedMessages = await message.channel.messages.fetch({ limit: 20 });
            const botMessages = fetchedMessages.filter(m => m.author.id === client.user.id);
            if (botMessages.size > 0) {
                await message.channel.bulkDelete(botMessages).catch(err => console.log("Lỗi xóa tin nhắn: " + err));
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

        // KIỂM TRA KHÓA (Cooldown)
        if (now < cooldownEnd) {
            const unixTimestamp = Math.floor(cooldownEnd / 1000);
            return await interaction.reply({ 
                content: `⏳ **Hệ thống đang bận!** Nút bấm đang bị khóa. Bạn có thể thử lại vào: <t:${unixTimestamp}:R>`, 
                ephemeral: true 
            });
        }

        // ĐẶT KHÓA 8 PHÚT
        cooldownEnd = Date.now() + (8 * 60 * 1000);

        await interaction.reply({ 
            content: `✨ Người dùng **${interaction.user.username}** đã kích hoạt treo IDX! Đang gửi lệnh tới Space...` 
        });

        try {
            const hfToken = process.env.HF_TOKEN; 
            const response = await axios.get(HF_URL, {
                params: { token: hfToken, user: interaction.user.username },
                timeout: 20000 // Đợi phản hồi trong 20s
            });
            
            // Nếu phản hồi từ Hugging Face có chứa chữ "SUCCESS"
            if (response.data.includes("SUCCESS")) {
                await interaction.followUp({ content: `✅ **Xác nhận từ Space:** ${response.data}`, ephemeral: true });
            } else {
                // Nếu không có SUCCESS, coi như là lỗi nội dung và đẩy xuống catch
                throw new Error(response.data);
            }

        } catch (error) {
            // MỞ KHÓA LẠI NÚT NẾU LỖI ĐỂ NGƯỜI KHÁC CÓ THỂ THỬ LẠI
            cooldownEnd = 0; 

            // Lấy thông báo lỗi chi tiết từ Hugging Face
            let detailError = "";
            if (error.response) {
                // Lỗi từ server (401, 500, 504...)
                detailError = `Hugging Face báo lỗi HTTP ${error.response.status}: ${error.response.data}`;
            } else if (error.request) {
                // Lỗi không phản hồi
                detailError = "Hugging Face Space không phản hồi (Timeout).";
            } else {
                // Lỗi code hoặc lỗi khác
                detailError = error.message;
            }

            // Gửi thông báo lỗi theo yêu cầu của bạn
            await interaction.followUp({ 
                content: `⚠️ **Hiện tại không thể truy cập được IDX, hãy báo cáo với chủ Server để được giải quyết.**\n*(Chi tiết: ${detailError})*`, 
                ephemeral: false 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
