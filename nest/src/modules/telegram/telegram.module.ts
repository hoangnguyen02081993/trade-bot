import { Module } from "@nestjs/common";
import { TelegramService } from "./telegram.service";

@Module({
    imports: [],
    exports: [TelegramService],
    providers: [TelegramService]
})
export class TelegramModule { }