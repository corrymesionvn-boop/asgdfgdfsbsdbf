const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot IDX Live!'));
app.listen(process.env.PORT || 3000);

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

client.on('messageCreate', async (message) => {
    if (message.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_idx')
                .setLabel('Khởi động Treo IDX (8 Phút)')
                .setStyle(ButtonStyle.Primary)
        );
        await message.reply({ content: '💻 **Hệ thống treo máy tự động:**', components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        // Thông báo cho cả server biết ai đã nhấn nút
        await interaction.reply({ 
            content: `📢 **Thông báo:** Người dùng **${interaction.user.username}** vừa kích hoạt treo IDX!` 
        });

        try {
            const hfToken = process.env.HF_TOKEN;
            const response = await axios.get("https://corrymesion-jduxyds.hf.space/trigger", {
                params: { token: hfToken, user: interaction.user.username }
            });
            
            // Cập nhật trạng thái sau khi Space phản hồi thành công
            await interaction.followUp({ content: `✅ Hệ thống Hugging Face xác nhận: **${response.data}**`, ephemeral: true });
        } catch (error) {
            await interaction.followUp({ content: `❌ Không thể kết nối Space!`, ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
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
