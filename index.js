const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const axios = require('axios');
const express = require('express');

// --- 1. TẠO SERVER GIỮ SỐNG BOT TRÊN RENDER ---
const app = express();
app.get('/', (req, res) => res.send('Bot Discord đang hoạt động!'));
app.listen(process.env.PORT || 3000);

// --- 2. CẤU HÌNH CLIENT DISCORD ---
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// --- 3. CẤU HÌNH THÔNG SỐ PING ---
// URL này phải khớp với Space của bạn
const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";
const COOLDOWN_TIME = 8 * 60 * 1000; // 8 phút
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
        
        // Kiểm tra thời gian chờ (Cooldown)
        if (now - lastUsed < COOLDOWN_TIME) {
            const timeLeft = Math.ceil((lastUsed + COOLDOWN_TIME - now) / 1000);
            return interaction.reply({ 
                content: `⚠️ Vui lòng đợi ${timeLeft} giây nữa mới có thể ping lại!`, 
                flags: [MessageFlags.Ephemeral] // Fix cảnh báo Interaction response deprecated
            });
        }

        // Trả lời phản hồi tạm thời để tránh lỗi "Unknown Interaction"
        await interaction.reply({ content: '⏳ Đang gửi lệnh ping tới web /trigger...' });

        try {
            // Lấy token từ Environment của Render để GitHub không quét được
            const myToken = process.env.HF_TOKEN; 

            // Thực hiện ping tới Space
            const response = await axios.get(HF_URL, {
                params: {
                    token: myToken,
                    user: interaction.user.username
                },
                headers: {
                    'Authorization': `Bearer ${myToken}` // Thêm header để mở khóa Space Private
                },
                timeout: 30000
            });

            lastUsed = now;
            await interaction.editReply(`✅ **Kết quả từ HF:** ${response.data.message || "Đã ping thành công!"}`);

            // Thông báo khi hết 8 phút
            setTimeout(() => {
                interaction.channel.send(`🔔 **Hết 8 phút!** Mời bạn **${interaction.user.username}** nhấn nút làm mới tiếp.`);
            }, COOLDOWN_TIME);

        } catch (error) {
            console.error("Lỗi Ping:", error.response ? error.response.status : error.message);
            
            let errorMsg = '❌ Không thể ping tới Space.';
            if (error.response && error.response.status === 404) {
                errorMsg = '❌ Lỗi 404: Link Space bị sai hoặc chưa có web /trigger!';
            } else if (error.response && error.response.status === 401) {
                errorMsg = '❌ Lỗi 401: Token không hợp lệ hoặc đã bị GitHub thu hồi!';
            }

            await interaction.editReply(errorMsg);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
            return interaction.reply({ 
                content: `⚠️ Vui lòng đợi ${timeLeft}s`, 
                flags: [MessageFlags.Ephemeral] 
            });
        }

        // BƯỚC 1: Xử lý ngay lập tức để không bị lỗi "Unknown Interaction"
        try {
            await interaction.deferReply(); 
        } catch (e) {
            return console.error("Không thể defer:", e.message);
        }

        // BƯỚC 2: Gửi lệnh tới Hugging Face (Sử dụng cả Header và Params để chắc chắn)
        axios({
            method: 'get',
            url: HF_URL,
            params: {
                token: process.env.HF_TOKEN,
                user: interaction.user.username
            },
            headers: {
                'Authorization': `Bearer ${process.env.HF_TOKEN}` // Cần thiết cho Space Private
            },
            timeout: 50000
        })
        .then(async () => {
            lastUsed = now;
            // BƯỚC 3: Cập nhật kết quả thành công lên Discord
            await interaction.editReply(`🚀 **${interaction.user.username}** đã làm mới IDX thành công!`);
            
            setTimeout(() => {
                interaction.channel.send(`🔔 **Hết 8 phút!** Bạn có thể nhấn làm mới tiếp.`);
            }, COOLDOWN_TIME);
        })
        .catch(async (error) => {
            console.error("Lỗi 404/Kết nối:", error.message);
            // Báo lỗi chi tiết hơn để bạn biết chuyện gì đang xảy ra
            await interaction.editReply(`❌ Lỗi ${error.response ? error.response.status : 'Kết nối'}: Hãy kiểm tra Space có đang "Running" không!`);
            lastUsed = 0;
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
