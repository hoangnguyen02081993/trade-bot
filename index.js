const { loadConfig } = require('./config');
const { log } = require('./log');
const { exchange, calculateProfit, getPriceAndVolume } = require('./trade');

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


const main = async () => {
    const config = loadConfig();
    loop(async () => {
        Promise.all(config.tradingPairs.map((pair) => {
            return new Promise(async (resolve, reject) => {
                try {
                    console.log('start with pair:', pair.name)
                    const { symbols, takeProfitThreadhold, feePercent } = pair;
                    const prices = await getPriceAndVolume(symbols);
                    const profit = calculateProfit(prices, takeProfitThreadhold, feePercent);
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

main();