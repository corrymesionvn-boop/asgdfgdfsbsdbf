const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

// Khởi tạo Express để Render không báo lỗi Port
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot Discord đang hoạt động 24/7!'));
app.listen(port, '0.0.0.0', () => console.log(`Server đang lắng nghe tại cổng ${port}`));

// Cấu hình Bot Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Các biến môi trường lấy từ mục Environment của Render
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const HF_TOKEN = process.env.HF_TOKEN;
const HF_TRIGGER_URL = "https://corrymesion-jduxyds.hf.space/trigger";

client.on('messageCreate', async (message) => {
    // Chỉ phản hồi khi nhận lệnh !keep và không phải tin nhắn từ bot
    if (message.author.bot || message.content !== '!keep') return;

    const reply = await message.reply("⏳ Đang gửi yêu cầu kích hoạt tới Hugging Face...");

    try {
        // Gửi yêu cầu POST kèm Token xác thực cho Space Private
        const response = await axios.post(HF_TRIGGER_URL, {}, {
            headers: { 
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            timeout: 25000 // Chờ phản hồi trong 25 giây
        });

        // Nếu Hugging Face trả về mã 200 (Thành công)
        if (response.status === 200) {
            await reply.edit("🚀 **Thành công!** Worker đã nhận lệnh và đang treo IDX cho bạn trong 8 phút.");
        }
    } catch (error) {
        console.error("Chi tiết lỗi:");
        let errorDetail = "Lỗi kết nối không xác định.";
        
        if (error.response) {
            // Lỗi từ phía Server Hugging Face (401, 404, 405)
            errorDetail = `Mã lỗi ${error.response.status}: Vui lòng kiểm tra lại URL hoặc Token trên Render!`;
        } else if (error.request) {
            // Không nhận được phản hồi
            errorDetail = "Không thể kết nối tới Hugging Face (Timeout).";
        }

        await reply.edit(`❌ **Thất bại:** ${errorDetail}`);
    }
});

// Đăng nhập Bot Discord
client.login(DISCORD_TOKEN).catch(err => {
    console.error("Lỗi đăng nhập Discord:", err.message);
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
