import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExchangeService } from './modules/exchange/exchange.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const exchangeService = app.get(ExchangeService)
  await app.listen(3000);
  console.log(`Application listening on ${await app.getUrl()}`)
  try {
    await exchangeService.run()
  } catch (ex) {
    console.log(ex)
  }
}
bootstrap();
