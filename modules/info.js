
// Information commands
class Info {
    constructor() {

    }

    // Get the TPS of the server
    getTPS(bot) {
        return bot.getTps()
    }
}

module.exports = Info