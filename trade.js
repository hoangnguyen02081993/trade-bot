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

module.exports = {
    getPriceAndVolume,
    calculateProfit,
    exchange
}