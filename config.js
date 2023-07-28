module.exports = {
    loadConfig: () => {
        return {
            period: 100,
            tradingPairs: [
                {
                    name: 'BTC-ETH-USDT',
                    symbols: ['BTCETH', 'BTCUSDT', 'ETHUSDT'],
                    takeProfitThreadhold: 2,
                    feePercent: 0.01,
                    volumn: 100 // USDT
                }
            ]
        }
    }
}