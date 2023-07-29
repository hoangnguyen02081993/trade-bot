import { registerAs } from "@nestjs/config";

export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    telegramToken: process.env.TELEGRAM_TOKEN,
    telegramChatId: process.env.TELEGRAM_CHATID
});

