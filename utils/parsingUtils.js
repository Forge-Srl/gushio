const DOUBLE_QUOTE = '"'
const SINGLE_QUOTE = '\''
const NO_QUOTE = Symbol('No quote')
const SINGLE_CHAR_POSSIBLY_ESCAPED = /\\?.|^$/g

export const parseCommandLineArgsAndOpts = (argsString) => {
    const aggregator = {
        result: [''],
        quote: false,
        quoteType: NO_QUOTE,
        isSingleQuoteToggle: function (current) {
            return current === SINGLE_QUOTE && [NO_QUOTE, SINGLE_QUOTE].includes(this.quoteType)
        },
        isDoubleQuoteToggle: function (current) {
            return current === DOUBLE_QUOTE && [NO_QUOTE, DOUBLE_QUOTE].includes(this.quoteType)
        },
        isNewChunk: function (current) {
            return !this.quote && (current === ' ' || current === '\t')
        },
        toggleSingleQuote: function () {
            this.quote = !this.quote
            this.quoteType = this.quote ? SINGLE_QUOTE : NO_QUOTE
        },
        toggleDoubleQuote: function () {
            this.quote = !this.quote
            this.quoteType = this.quote ? DOUBLE_QUOTE : NO_QUOTE
        },
        newChunk: function () {
            this.result.push('')
        },
        append: function (current) {
            this.result[this.result.length - 1] += current.replace(/\\(.)/, '$1')
        }
    }

    const parsedArgs = argsString.match(SINGLE_CHAR_POSSIBLY_ESCAPED).reduce((aggregator, current) => {
        if (aggregator.isDoubleQuoteToggle(current)) {
            aggregator.toggleDoubleQuote()
        } else if (aggregator.isSingleQuoteToggle(current)) {
            aggregator.toggleSingleQuote()
        } else if (aggregator.isNewChunk(current)) {
            aggregator.newChunk()
        } else {
            aggregator.append(current)
        }
        return aggregator
    }, aggregator)

    return parsedArgs.result.filter(string => string)
}