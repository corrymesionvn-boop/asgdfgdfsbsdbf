const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express'); // Thêm express để giữ port

const app = express();
const port = process.env.PORT || 3000;

// Tạo server web để Render không báo lỗi
app.get('/', (req, res) => res.send('Bot Discord is Running!'));
app.listen(port, () => console.log(`Listening on port ${port}`));

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";
const COOLDOWN_TIME = 8 * 60 * 1000; 
let lastUsed = 0;

client.on('messageCreate', async (message) => {
    if (message.content === '!idx') {
        const button = new ButtonBuilder()
            .setCustomId('trigger_idx')
            .setLabel('Khởi động/Làm mới IDX')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        await message.reply({ 
            content: 'Hệ thống treo IDX sẵn sàng:', 
            components: [row] 
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        const now = Date.now();
        
        if (now - lastUsed < COOLDOWN_TIME) {
            const timeLeft = Math.ceil((lastUsed + COOLDOWN_TIME - now) / 1000);
            return interaction.reply({ 
                content: `⚠️ Hệ thống đang chạy! Vui lòng đợi thêm **${timeLeft} giây** nữa để làm mới lại.`, 
                ephemeral: true 
            });
        }

        const userName = interaction.user.username;
        try {
            await interaction.deferReply();
            
            await axios.get(`${HF_URL}?user=${encodeURIComponent(userName)}`);
            
            lastUsed = now;
            await interaction.editReply({ 
                content: `🚀 **${userName}** đã **Khởi động/Làm mới IDX** thành công! Hệ thống sẽ treo trong 8 phút.` 
            });

            setTimeout(() => {
                interaction.channel.send("🔔 **8 phút đã trôi qua!** IDX đã hoàn thành chu kỳ, mọi người có thể nhấn nút làm mới tiếp.");
            }, COOLDOWN_TIME);

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Không thể kết nối tới Space. Vui lòng kiểm tra lại trạng thái Hugging Face!' });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
