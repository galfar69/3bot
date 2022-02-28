const { createHash } = require('crypto');

class Utility {

    constructor() {

    }

    // Get the TPS of the server
    getTPS() {
        return bot.getTps()
    }

    hash(string) {
        return createHash('sha256').update(string).digest('hex');
    }
}

module.exports = Utility