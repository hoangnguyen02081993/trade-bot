import { get } from "lodash";

export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    telegramToken: process.env.TELEGRAM_TOKEN,
    telegramChatId: process.env.TELEGRAM_CHATID,
    ccxt: {
        exchanges: [{
            exchangeId: 'binance',
            apiKey: process.env.BINANCE_APIKEY,
            secret: process.env.BINANCE_SECRET,
            sandboxMode: /^true$/i.test(process.env.BINANCE_SANDBOX),
            loadMarketsOnStartup: false, // unused
            verbose: false, // unused
        }]
    },
    exchange: {
        period: 1,
        tradingPairs: Array(100).fill({}).map((_, index) => {
            return {
                symbols: get(process, ['env', `EXCHANGE_TRADINGPAIRS_${index}_SYMBOLS`])?.split(','),
                takeProfitThreadhold: parseInt(get(process, ['env', `EXCHANGE_TRADINGPAIRS_${index}_TAKE_PROFIT_THEAD_HOLD`], '10')),
                volumn: parseInt(get(process, ['env', `EXCHANGE_TRADINGPAIRS_${index}_VOLUMN`], '100')),
            }
        }).filter((i) => i.symbols)
    }
});