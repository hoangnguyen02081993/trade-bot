const sendTelegram = (message) => {
    // todo send
    console.log(message);
}

const log = (message, type) => {
    const telegramMessage = `${new Date().toISOString()} ${type}: ${message}`;
    sendTelegram(telegramMessage);
}

const loop = async (func, period) => {
    try {
        await func();
    }
    catch (e) {
        log(e, 'error');
    }
    finally {
        setTimeout(() => loop(func), period);
    }
}

const loadConfig = () => {
    return {
        period: 100,
        tradingPairs: [
            {
                symbols: ['BTCETH', 'BTCUSDT', 'ETHUSDT'],
                takeProfitThreadhold: 2,
                feePercent: 0.01,
                volumn: 100 // USDT
            }
        ]
    }
}

const getPriceAndVolume = async (symbols) => {
    // todo get real price and volume
    return symbols.reduce((a, b) => {
        a[b] = {
            price: 1,
            volume: 1
        };
        return a;
    }, {})
}

const calculateProfit = (prices, takeProfitPercent, feePercent) => {
    return 1; // todo calculate
}

const exchange = async (symbols, volumn) => {
    // todo exchange
    return true;
}


const main = async () => {
    const config = loadConfig();
    console.log('rinnnig')
    loop(async () => {
        Promise.all(config.tradingPairs.map((pair) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const { symbols, takeProfitThreadhold, feePercent } = pair;
                    const prices = await getPriceAndVolume(symbols);
                    const profit = calculateProfit(prices, takeProfitPercent, feePercent);
                    if (profit >= takeProfitThreadhold) {
                        await exchange(symbols, volumn);
                        log(`Exchange ${symbols.join(', ')} with profit ${profit}`, 'info');
                    }
                    resolve();
                }
                catch (e) {
                    log(e, 'error');
                    reject(e);
                }
            });
        }))
    }, config.period);
}