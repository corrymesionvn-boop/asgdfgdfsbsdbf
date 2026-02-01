const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const axios = require('axios');
const app = express();

const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";
const HF_TOKEN = process.env.HF_TOKEN;

app.get('/', (req, res) => res.send('Bot Controller is Active'));
app.listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', async (msg) => {
    if (msg.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('run_idx').setLabel('🚀 Kích hoạt IDX').setStyle(ButtonStyle.Success),
        );
        await msg.reply({ content: 'Nhấn nút để bắt đầu chu kỳ 8 phút:', components: [row] });
    }
});

client.on('interactionCreate', async (i) => {
    if (!i.isButton()) return;
    
    // PHẢI GỌI NGAY: Tránh lỗi Unknown Interaction (10062)
    try {
        await i.deferReply({ ephemeral: true });
    } catch (e) { return console.error("Không thể defer:", e); }

    try {
        // Gọi Hugging Face với Token xác thực
        await axios.get(`${HF_URL}?user=${i.user.username}`, {
            timeout: 10000,
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'User-Agent': 'Mozilla/5.0'
            }
        });
        await i.editReply(`✅ **Thành công!** Tín hiệu đã gửi tới Hugging Face.`);
    } catch (e) {
        console.error("Lỗi kết nối HF:", e.message);
        await i.editReply(`❌ **Lỗi:** Không thể kết nối tới HF. Hãy kiểm tra Logs bên HF.`);
    }
});

client.login(process.env.DISCORD_TOKEN);
