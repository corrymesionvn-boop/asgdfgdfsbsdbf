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
        // TÍNH NĂNG: Xóa các tin nhắn cũ của bot để bảng điều khiển luôn ở dưới cùng
        try {
            const fetchedMessages = await message.channel.messages.fetch({ limit: 10 });
            const botMessages = fetchedMessages.filter(m => m.author.id === client.user.id);
            if (botMessages.size > 0) await message.channel.bulkDelete(botMessages);
        } catch (err) { console.log("Không thể xóa tin nhắn cũ."); }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_idx')
                .setLabel('Khởi động/Refresh IDX')
                .setStyle(ButtonStyle.Success)
        );
        const responseContent = "**🚀 BẢNG ĐIỀU KHIỂN TREO IDX:**\nBot sẽ treo Web trong 8 phút. Nhấn nút bên dưới để bắt đầu.";
        await message.reply({ content: responseContent, components: [row] });
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
            
            // GIỮ NGUYÊN PHƯƠNG THỨC PING VỚI TOKEN
            const response = await axios.get(HF_URL, {
                params: { 
                    token: hfToken, 
                    user: interaction.user.username 
                },
                timeout: 15000 
            });
            
            // Nếu Space trả về chuỗi có chữ SUCCESS
            if (response.data.toString().includes("SUCCESS")) {
                await interaction.followUp({ content: `✅ **Xác nhận:** ${response.data}`, ephemeral: true });
            } else {
                // Nếu trả về lỗi khác (như chữ Oops từ dò tìm)
                throw new Error(response.data);
            }

        } catch (error) {
            // Mở khóa lại nút nếu lỗi để có thể thử lại ngay
            cooldownEnd = 0; 

            let errorMessage = error.message;
            if (error.response) {
                errorMessage = `Hugging Face lỗi (HTTP ${error.response.status}): ${error.response.data}`;
            }

            // Câu báo lỗi đúng theo yêu cầu của bạn
            await interaction.followUp({ 
                content: `⚠️ **Hiện tại không thể truy cập được IDX, hãy báo cáo với chủ Server để được giải quyết.**\n(Lỗi: ${errorMessage})`, 
                ephemeral: false 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
