export interface CcxtConfig {
    exchanges: Array<ExchangeOption>
}
export interface ExchangeOption {
    exchangeId: string
    apiKey: string
    secret: string
    sandboxMode: boolean,
    loadMarketsOnStartup: false,
    verbose: false,
    marketsCacheExpireMs?: number
}