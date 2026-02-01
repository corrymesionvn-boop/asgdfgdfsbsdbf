const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

// Thay link Space của bạn vào đây
const HF_URL = "https://corrymesion-jduxyds.hf.space/trigger";
const COOLDOWN_TIME = 8 * 60 * 1000; 
let lastUsed = 0;

client.on('messageCreate', async (message) => {
    if (message.content === '!idx') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('trigger_idx')
                .setLabel('Khởi động/Làm mới IDX') // Nhãn nút theo yêu cầu
                .setButtonStyle(ButtonStyle.Success)
        );
        await message.reply({ content: 'Hệ thống treo IDX sẵn sàng:', components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'trigger_idx') {
        const now = Date.now();
        
        // Kiểm tra 8 phút
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
            
            // Gọi API sang HF kèm tên người tương tác
            await axios.get(`${HF_URL}?user=${encodeURIComponent(userName)}`);
            
            lastUsed = now;
            await interaction.editReply({ 
                content: `🚀 **${userName}** đã **Khởi động/Làm mới IDX** thành công! Hệ thống sẽ treo trong 8 phút.` 
            });
        } catch (error) {
            await interaction.editReply({ content: '❌ Không thể kết nối tới Space. Vui lòng kiểm tra lại trạng thái Hugging Face!' });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
