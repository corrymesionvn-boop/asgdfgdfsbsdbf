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
        try {
            const fetchedMessages = await message.channel.messages.fetch({ limit: 10 });
            const botMessages = fetchedMessages.filter(m => m.author.id === client.user.id);
            if (botMessages.size > 0) await message.channel.bulkDelete(botMessages);
        } catch (err) { console.log("Lỗi xóa tin nhắn cũ."); }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_idx')
                .setLabel('Khởi động/Refresh IDX')
                .setStyle(ButtonStyle.Success)
        );
        const responseContent = "🚀 **BẢNG ĐIỀU KHIỂN TREO IDX**\nBot sẽ treo trình duyệt trong 8 phút.";
        await message.channel.send({ content: responseContent, components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        const now = Date.now();

        if (now < cooldownEnd) {
            const unixTimestamp = Math.floor(cooldownEnd / 1000);
            return await interaction.reply({ 
                content: `⏳ **Hệ thống đang bận!** Thử lại sau: <t:${unixTimestamp}:R>`, 
                ephemeral: true 
            });
        }

        // BƯỚC QUAN TRỌNG: deferReply để tránh lỗi "Unknown Interaction"
        await interaction.deferReply(); 

        cooldownEnd = Date.now() + (8 * 60 * 1000);

        try {
            const hfToken = process.env.HF_TOKEN;
            
            // Ping Hugging Face Space với Token
            const response = await axios.get(HF_URL, {
                params: { 
                    token: hfToken, 
                    user: interaction.user.username 
                },
                timeout: 20000 
            });
            
            if (response.data.toString().includes("SUCCESS")) {
                await interaction.editReply({ content: `✅ **Xác nhận:** ${response.data}` });
            } else {
                throw new Error(response.data);
            }

        } catch (error) {
            cooldownEnd = 0;
            let errorMessage = error.message;
            if (error.response) {
                errorMessage = `Hugging Face lỗi (HTTP ${error.response.status}): ${error.response.data}`;
            }

            await interaction.editReply({ 
                content: `⚠️ **Hiện tại không thể truy cập được IDX, hãy báo cáo với chủ Server để được giải quyết.**\n(Lỗi: ${errorMessage})`
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
