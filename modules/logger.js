


class Logging {
    constructor(willLog) {
        this.willLog = willLog
    }

    logg(payload) {
        if (this.willLog === true) console.log(toString(payload))
    }
}

module.exports = Logging