const sendTelegram = (message) => {
    // todo send
    console.log(message);
}

module.exports = {
    log: (message, type) => {
        const sendMessage = `${new Date().toISOString()} ${type}: ${message}`;
        sendTelegram(sendMessage);
    }
}