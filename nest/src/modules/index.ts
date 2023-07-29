import { CcxtModule } from "./ccxt/ccxt.module";
import { ExchangeModule } from "./exchange/exchange.module";
import { TelegramModule } from "./telegram/telegram.module";

export default [
    ExchangeModule,
    CcxtModule,
    TelegramModule
]