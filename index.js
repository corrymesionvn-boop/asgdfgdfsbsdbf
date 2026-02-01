const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger"; // Link HF của bạn

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    // Báo cho Discord là "đã nhận lệnh", giúp nút bấm không bị báo lỗi đỏ
    await interaction.reply({ content: '⏳ Đang gửi tín hiệu tới Hugging Face...', ephemeral: true });

    try {
        // GIẢ LẬP TRUY CẬP WEB: Gửi lệnh Ping tới HF
        await axios.get(HF_URL); 
        
        await interaction.editReply('✅ **Thành công!** Hugging Face đã nhận được lệnh và đang treo IDX.');
    } catch (error) {
        await interaction.editReply('❌ **Lỗi:** Không thể "nhấn chuông" Hugging Face. Hãy kiểm tra xem Space HF có bị tắt không.');
    }
});

client.login(process.env.DISCORD_TOKEN);
