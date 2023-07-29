import { Module } from "@nestjs/common";
import { TelegramModule } from "../telegram/telegram.module";
import { ExchangeService } from "./exchange.service";

@Module({
    imports: [TelegramModule],
    exports: [ExchangeService],
    providers: [ExchangeService]
})
export class ExchangeModule { }