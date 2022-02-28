const { createHash } = require('crypto');


// Purely utility. Math, hashing, etc...
class Utility {

    constructor() {

    }

    hash(string) {
        return createHash('sha256').update(string).digest('hex');
    }
}

module.exports = Utility