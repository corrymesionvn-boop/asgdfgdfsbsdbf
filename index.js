const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot is Online!'));
app.listen(process.env.PORT || 3000);

// KHỞI TẠO VỚI ĐẦY ĐỦ INTENTS
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent // QUAN TRỌNG NHẤT ĐỂ ĐỌC LỆNH !idx
    ] 
});

client.on('ready', () => {
    console.log(`✅ ĐÃ KẾT NỐI: Bot đang chạy với tên ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    // Log mọi tin nhắn để kiểm tra Bot có "thấy" bạn không
    console.log(`📩 Nhận tin nhắn: ${message.content} từ ${message.author.username}`);

    if (message.content === '!idx') {
        const button = new ButtonBuilder()
            .setCustomId('trigger_idx')
            .setLabel('Khởi động/Làm mới IDX')
            .setStyle(ButtonStyle.Success);
        
        const row = new ActionRowBuilder().addComponents(button);

        try {
            await message.reply({ 
                content: '🤖 Hệ thống đã nhận lệnh! Nhấn nút bên dưới:', 
                components: [row] 
            });
            console.log("✅ Đã gửi nút bấm thành công.");
        } catch (err) {
            console.error("❌ Lỗi khi phản hồi lệnh !idx:", err);
        }
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        await interaction.reply({ content: '⏳ Đang ping tới Space (Sử dụng State)...', flags: [MessageFlags.Ephemeral] });

        try {
            const hfToken = process.env.HF_TOKEN; 
            const response = await axios.get("https://corrymesion-jduxyds.hf.space/trigger", {
                params: { token: hfToken, user: interaction.user.username },
                headers: { 'Authorization': `Bearer ${hfToken}` }
            });

            await interaction.editReply(`✅ **Phản hồi từ Space:** ${response.data}`);
        } catch (error) {
            console.error("Lỗi Ping:", error.message);
            await interaction.editReply(`❌ Lỗi: Không thể kết nối tới Space. Kiểm tra HF_TOKEN trên Render!`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
