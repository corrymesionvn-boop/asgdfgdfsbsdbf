const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const axios = require('axios');
const app = express();

// Lấy Token từ biến môi trường bạn đã cài đặt
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN; 
const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";

app.get('/', (req, res) => res.send('Bot Controller is Running with HF_TOKEN'));
app.listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', async (msg) => {
    if (msg.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('activate_idx').setLabel('🚀 Kích hoạt IDX (Private)').setStyle(ButtonStyle.Success),
        );
        await msg.reply({ content: 'Hệ thống Private đã sẵn sàng. Nhấn để treo 8 phút:', components: [row] });
    }
});

client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;
    
    await i.deferReply({ ephemeral: true });

    try {
        // GỬI KÈM TOKEN ĐỂ VƯỢT QUA LỚP BẢO MẬT PRIVATE
        await axios.get(`${HF_URL}?user=${i.user.username}`, {
            timeout: 15000,
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`, // Gửi Token tại đây
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        await i.editReply(`✅ **Xác thực thành công!** Hugging Face đã nhận lệnh treo IDX.`);
    } catch (e) {
        console.error("Lỗi xác thực HF:", e.message);
        // Nếu lỗi 401 hoặc 403 là do Token sai hoặc hết hạn
        await i.editReply(`❌ **Lỗi:** Không thể xác thực với Hugging Face (Check HF_TOKEN).`);
    }
});

client.login(DISCORD_TOKEN);
