class Logger {
    prefix = 'Gushio'

    info(message) {
        console.log(`[${this.prefix}] ${message}`)
    }

    error(message) {
        console.error(`[${this.prefix}] ${message}`)
    }
}

module.exports = {Logger}