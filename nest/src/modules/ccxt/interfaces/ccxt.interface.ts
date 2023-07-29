export interface CcxtConfig {
    exchanges: Array<{
        exchangeId: string
        apiKey: string
        secret: string
        sandboxMode: true,
        loadMarketsOnStartup: false,
        verbose: false,
        loadMarkets: false
    }>
}