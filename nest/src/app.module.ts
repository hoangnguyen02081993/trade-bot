import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config';
import modules from './modules';
import { CcxtModule } from './modules/ccxt/ccxt.module';
import { CcxtConfig } from './modules/ccxt/interfaces/ccxt.interface';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    CcxtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get<CcxtConfig>('ccxt'),
      isGlobal: true
    }),
    ...modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
