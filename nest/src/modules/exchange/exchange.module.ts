import { Module } from "@nestjs/common";
import { CcxtModule } from "../ccxt/ccxt.module";
import { ExchangeService } from "./exchange.service";
import { TelegramModule } from "../telegram/telegram.module";

@Module({
    imports: [CcxtModule, TelegramModule],
    exports: [ExchangeService],
    providers: [ExchangeService]
})
export class ExchangeModule { }