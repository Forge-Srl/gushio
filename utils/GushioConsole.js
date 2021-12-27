const {Console} = require('console')

const LOG_LEVELS = {
    verbose: 10,
    info: 6,
    error: 2,
    silent: 0
}

const GushioLogFormat = '[Gushio] %s'

class GushioConsole extends Console {

    constructor(stdout, stderr, logLevel = 'info') {
        super({stdout, stderr, groupIndentation: 4})
        this.logLevel = logLevel
    }

    get isVerbose() {
        return LOG_LEVELS[this.logLevel] >= LOG_LEVELS.verbose
    }

    get isInfo() {
        return LOG_LEVELS[this.logLevel] >= LOG_LEVELS.info
    }

    get isError() {
        return LOG_LEVELS[this.logLevel] >= LOG_LEVELS.error
    }

    verbose(...args) {
        if (this.isVerbose) {
            super.log(...args)
        }
    }

    info(...args) {
        if (this.isInfo) {
            super.log(...args)
        }
    }

    log(...args) {
        this.info(...args)
    }

    warn(...args) {
        this.error(...args)
    }

    error(...args) {
        if (this.isError) {
            super.error(...args)
        }
    }

    // TODO: implement
    /*
    async spinner() {
    }
    */

    // TODO: implement
    /*
    async input() {
    }
    */
}

module.exports = {GushioConsole, GushioLogFormat}