const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot Discord đang chạy!'));
app.listen(port, '0.0.0.0', () => console.log(`Server live on port ${port}`));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Lấy thông tin từ mục Environment Variables trên Render
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;
const HF_TRIGGER_URL = "https://corrymesion-jduxyds.hf.space/trigger";

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.content !== '!keep') return;

    const reply = await message.reply("⏳ Đang gửi yêu cầu tới Hugging Face...");

    try {
        const response = await axios.post(HF_TRIGGER_URL, {}, {
            headers: { 
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 20000 
        });

        if (response.status === 200) {
            await reply.edit("🚀 **Thành công!** Worker đã nhận lệnh và đang treo IDX cho bạn.");
        }
    } catch (error) {
        let errorDetail = "Lỗi kết nối.";
        if (error.response) {
            errorDetail = `Mã lỗi ${error.response.status}: Vui lòng kiểm tra lại URL hoặc Token!`;
        }
        await reply.edit(`❌ **Thất bại:** ${errorDetail}`);
    }
});

client.login(DISCORD_TOKEN);
                },
                timeout: 15000 // Chờ 15 giây
            });

            if (response.status === 200) {
                // Đọc tin nhắn từ Hugging Face gửi về
                const msg = response.data.message || "Worker đã bắt đầu!";
                await reply.edit(`🚀 **Thành công!**\n💬 Phản hồi: \`${msg}\`\n📸 Trình duyệt đang mở IDX và chụp ảnh màn hình...`);
            }
        } catch (error) {
            console.error("Lỗi kết nối chi tiết:", error.message);
            let errorMessage = "Không thể kết nối tới Hugging Face.";
            
            if (error.response) {
                // Lỗi từ phía Server (401, 404, 405, 500)
                errorMessage = `Mã lỗi ${error.response.status}: ${JSON.stringify(error.response.data)}`;
            } else if (error.request) {
                // Lỗi không phản hồi
                errorMessage = "Hugging Face không phản hồi (Timeout).";
            }

            await reply.edit(`❌ **Lỗi:** ${errorMessage}\n👉 Kiểm tra lại HF_TOKEN và link Space!`);
        }
    }
});

client.login(DISCORD_TOKEN).catch(err => console.error("Lỗi Login Discord:", err.message));
