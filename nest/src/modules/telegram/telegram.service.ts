import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import TelegramBot from "node-telegram-bot-api";

@Injectable()
export class TelegramService {
    private telegramBot: TelegramBot;
    constructor(
        private readonly configService: ConfigService
    ) {
        const token = this.configService.get<string>('telegramToken')
        // Create a bot that uses 'polling' to fetch new updates
        this.telegramBot = new TelegramBot(token, { polling: true });
    }
    sent(
        message: string
    ) {
        const chatId = this.configService.get<string>('telegramChatId')
        // send back the matched "whatever" to the chat
        return this.telegramBot.sendMessage(chatId, message);
    }
}