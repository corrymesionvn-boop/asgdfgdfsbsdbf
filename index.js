const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot IDX Live!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ] 
});

// Link Space của bạn
const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger"; 

client.on('messageCreate', async (message) => {
    if (message.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_idx')
                .setLabel('Khởi động/Treo IDX (8 Phút)')
                .setStyle(ButtonStyle.Success)
        );
        await message.reply({ 
            content: '💻 **Hệ thống điều khiển treo máy:**', 
            components: [row] 
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        // Thông báo tên người kích hoạt
        await interaction.reply({ 
            content: `✨ Người dùng **${interaction.user.username}** đã kích hoạt treo IDX!` 
        });

        try {
            const hfToken = process.env.HF_TOKEN; 

            const response = await axios.get(HF_URL, {
                params: { 
                    token: hfToken, 
                    user: interaction.user.username 
                },
                // Gửi chìa khóa để vào Space Private
                headers: {
                    'Authorization': `Bearer ${hfToken}`
                },
                timeout: 10000 
            });
            
            await interaction.followUp({ 
                content: `✅ **Xác nhận:** ${response.data}`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error("Lỗi:", error.message);
            await interaction.followUp({ 
                content: `❌ Lỗi kết nối: Space có thể đang khởi động lại hoặc sai Token!`, 
                ephemeral: true 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
