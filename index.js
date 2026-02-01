const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const axios = require('axios');
const app = express();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";

app.get('/', (req, res) => res.send("Bot is Alive"));
app.listen(process.env.PORT || 3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('messageCreate', async (msg) => {
    if (msg.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('activate_idx').setLabel('🚀 Khởi động / Làm mới IDX').setStyle(ButtonStyle.Success),
        );
        await msg.reply({ content: 'Hệ thống đã sẵn sàng. Nhấn để treo 8 phút:', components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    // QUAN TRỌNG: Báo cho Discord là bot đang xử lý, đừng hiện lỗi "Lỗi tương tác"
    await interaction.deferReply({ ephemeral: true });

    try {
        const response = await axios.get(`${HF_URL}?user=${interaction.user.username}`, {
            timeout: 10000 // Chờ tối đa 10 giây
        });

        if (response.status === 200) {
            await interaction.editReply(`✅ **Thành công!** Hugging Face đang thực thi lệnh cho **${interaction.user.username}**.`);
        }
    } catch (e) {
        console.error(e);
        await interaction.editReply(`❌ **Lỗi:** Không thể kết nối tới Hugging Face Space. Hãy kiểm tra tab Logs bên HF.`);
    }
});

client.login(DISCORD_TOKEN);
