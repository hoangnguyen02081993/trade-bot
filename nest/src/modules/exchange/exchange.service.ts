import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OrderBook } from "ccxt";
import { first, last } from "lodash";
import { CcxtService } from "../ccxt/ccxt.service";
import { TelegramService } from "../telegram/telegram.service";
import { ExchangeConfig, MartketExchange, TradingPair } from "./config.interface";

@Injectable()
export class ExchangeService {
    private readonly logger: Logger = new Logger(ExchangeService.name)
    constructor(
        private readonly configService: ConfigService,
        private readonly ccxtService: CcxtService,
        private readonly telegramService: TelegramService
    ) { }

    log = async (message: string, type: 'DEBUG' | 'ERROR' | 'LOG' = 'LOG') => {
        const telegramMessage = `${new Date().toISOString()} ${type}: \n${message}`;
        this.logger.log(message);
        if (type !== 'DEBUG') this.telegramService.sent(telegramMessage);
    }

    loop = async (func: Function, period) => {
        try {
            await func();
        }
        catch (e) {
            this.log(e, 'ERROR');
        }
        finally {
            setTimeout(() => this.loop(func, period), period);
        }
    }

    getPriceAndVolume = (markets: Array<Array<number>>) => {
        const data = first(markets)
        return {
            price: first(data),
            volumne: last(data)
        }
    }

    calculateProfit = async (
        market1: MartketExchange,
        market2: MartketExchange,
        market3: MartketExchange,
        volumn: number,
        tradingFees: number,
    ): Promise<number> => {
        // EXCHANGE USDT to Symbol1
        const pair1Volumn = volumn / market1.sell.price
        // EXCHANGE Symbol1 to Symbol2
        const pair3Amount = market2.buy.price * pair1Volumn
        // EXCHANGE Symbol2 TO USDT
        const profit1 = (market3.buy.price * pair3Amount) - tradingFees
        // if (profit1 > volumn) {
        //     const rs1 = await this.exchange(market1.symbol, 'limit', 'buy', pair1Volumn, market1.sell.price)
        //     const rs2 = await this.exchange(market2.symbol, 'limit', 'sell', first(rs1.trades).amount, market2.buy.price)
        //     await this.exchange(market3.symbol, 'limit', 'sell', first(rs2.trades).amount, market3.buy.price)
        //     return profit1
        // }

        // EXCHANGE USDT To Symbol2
        const symbol2Amount = volumn / market3.sell.price
        // EXCHANGE Symbol2 To Symbol1
        const symbol1Amount = market2.sell.price * symbol2Amount
        // EXCHANGE Symbol1 to USDT 
        const profit2 = (market1.buy.price * symbol1Amount) - tradingFees
        // if (profit2 > volumn) {
        //     const rs1 = await this.exchange(market3.symbol, 'limit', 'buy', symbol2Amount, market3.sell.price)
        //     const rs2 = await this.exchange(market2.symbol, 'limit', 'buy', first(rs1.trades).amount * market2.buy.price, market2.buy.price)
        //     await this.exchange(market3.symbol, 'limit', 'sell', first(rs2.trades).amount, market1.buy.price)
        //     return profit2
        // }
        return Math.max(profit1, profit2)
    }

    exchange = async (symbols, type: 'market' | 'limit', side: 'buy' | 'sell', volumn: number, price: number) => {
        const binance = await this.ccxtService.getClient('binance')
        return await binance.createOrder(symbols, type, side, volumn, price)
    }

    getTradingsFee = (
        volumn: number,
        tier: 'VIP1' | 'VIP2' | 'VIP3' | 'NORMAL' = 'NORMAL',
        type: 'marker' | 'taker' = 'marker'
    ): number => {
        const fees = {
            VIP1: { marker: 0.0900, taker: 0.1000 },
            VIP2: { marker: 0.0800, taker: 0.1000 },
            VIP3: { marker: 0.0420, taker: 0.0600 },
            NORMAL: { marker: 0.1000, taker: 0.1000 }
        };
        return volumn / 100 * fees[tier][type]
    }

    getMarket = (input: OrderBook & Partial<{ symbol: string }>): MartketExchange => {
        const { symbol, bids, asks } = input
        return {
            symbol,
            buy: this.getPriceAndVolume(bids),
            sell: this.getPriceAndVolume(asks)
        }
    }

    run = async () => {
        const binance = await this.ccxtService.getClient('binance')
        const cal = async (tradingPair: TradingPair) => {
            const { volumn, symbols } = tradingPair
            const [orderBook1, orderBook2, orderBook3] = await Promise.all(symbols.map((symbol) => {
                return binance.watchOrderBook(symbol, 5)
                // return binance.fetchOrderBook(symbol, 1,)
            }))
            const marketOrder1 = this.getMarket(orderBook1)
            const marketOrder2 = this.getMarket(orderBook2)
            const marketOrder3 = this.getMarket(orderBook3)
            const tradingFees = this.getTradingsFee(tradingPair.volumn, 'NORMAL', 'marker') + this.getTradingsFee(volumn, 'NORMAL', 'taker')
            const profit = await this.calculateProfit(marketOrder1, marketOrder2, marketOrder3, volumn, tradingFees)
            if (profit > volumn) {
                const message = `\n[${symbols}] Estimate: ${profit - volumn} | ${profit}\n`
                this.log(message, 'DEBUG')
                const balance = await await binance.fetchTotalBalance()
                this.log(`Current Balance: \n${Object.keys(balance).filter((k) => !!balance[k] && balance[k] > 0.0001).map((k) => `${k}: ${balance[k]}`).join('\n')}`, 'LOG')
                return
            }
            this.log(`PAIR [${symbols}] | ${profit - volumn}\n`, 'DEBUG')
        }

        const configs = [this.configService.get<ExchangeConfig>('exchange')]
        await Promise.all(configs.flatMap(({ period, tradingPairs }) =>
            tradingPairs.map((tradingPair) => this.loop(() => cal(tradingPair), period))
        ))
    }
}
