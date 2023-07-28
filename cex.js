const ccxt = require ('ccxt');

const strategys = {
    binance: 'binance',
}

function binance() {
    const binance = {}; //mock
    return binance
}

const getCexInstance = (strategy) => {
    switch (strategy) {
        case strategys.binance:
            return binance();
        default: 
            return binance();
    }
}

module.exports = {
    getCexInstance,
    strategys
};