import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config';
import modules from './modules';
import { CcxtModule } from './modules/ccxt/ccxt.module';

@Module({
  imports: [
    CcxtModule.register({
      exchanges: [{
        exchangeId: 'binance',
        apiKey: 'H53JItGKH62uDYdy6DnN43Ky61oxy77k44EcZOiKgdtFXfCE3cSLgxke0pJoT0q3',
        secret: 'V1y1X6viGQ85oyKVGGVce6NFriqlLFzwU519J9AizfnJkafZ3GqSM3TjIsQNIFRE',
        sandboxMode: true,
        loadMarketsOnStartup: false,
        verbose: false,
        loadMarkets: false
      }],
      isGlobal: true
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    ...modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
