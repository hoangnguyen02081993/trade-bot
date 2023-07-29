export interface ExchangeConfig {
    period: number,
    tradingPairs: Array<TradingPair>
}
export interface TradingPair {
    symbols: Array<string>//['BTCETH', 'BTCUSDT', 'ETHUSDT'],
    takeProfitThreadhold: number,
    // feePercent: 0.01,
    volumn: number // USDT
}
export interface MartketExchange {
    symbol: string;
    buy: Exchange,
    sell: Exchange;
}
export interface Exchange {
    price: number;
    volumne: number;
}