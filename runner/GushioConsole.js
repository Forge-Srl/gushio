import {Console} from 'console'
import Enquirer from 'enquirer'
import isString from 'is-string'
import {oraPromise} from 'ora'

const LOG_LEVELS = {
    verbose: 10,
    info: 6,
    error: 2,
    silent: 0
}

export const GushioDepsLogFormat = '[Gushio|Deps] %s'
export const GushioScriptLogFormat = '[Gushio|Script] %s'
export const GushioTraceLogFormat = '[Gushio|Trace] %d:%d\t %s'
export const traceSymbol = Symbol('trace')

export class GushioConsole extends Console {

    constructor(stdin, stdout, stderr, logLevel = 'info', trace = false) {
        super({stdout, stderr, groupIndentation: 4})
        this.logLevel = logLevel
        this.trace = trace
        /* TODO: uncomment following line when next enquirer version is released solving a bug in custom IO streams
         *       see: https://github.com/enquirer/enquirer/issues/308, https://github.com/enquirer/enquirer/issues/338
         */
        // this.enquirer = new Enquirer({stdout, stdin})
        this.enquirer = new Enquirer({})
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

    [traceSymbol](line, column, code, additionalContext = {}) {
        if (!this.trace) {
            return
        }

        if (additionalContext.loopType) {
            this.info(GushioTraceLogFormat, line, column, `LOOP [${additionalContext.loopType}]: ${code}`)
        } else if (additionalContext.conditionalType) {
            this.info(GushioTraceLogFormat, line, column, `CONDITIONAL [${additionalContext.conditionalType}]: ${code}`)
        } else {
            this.info(GushioTraceLogFormat, line, column, code)
        }
    }

    async spinner(promise, textOrSettings) {
        let settings
        if (isString(textOrSettings)) {
            settings = {stream: this._stdout, text: textOrSettings}
        } else {
            settings = Object.assign({stream: this._stdout}, textOrSettings)
        }
        settings.isSilent = !this.isInfo
        return await oraPromise(promise, settings)
    }

    async input(...questions) {
        return await this.enquirer.prompt(questions)
    }
}