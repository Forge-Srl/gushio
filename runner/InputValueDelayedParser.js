export class InputValueDelayedParser {
    static commanderParserCallback(actualParser) {
        return (value, defaultOrAggregator) => {
            let aggregator
            if (defaultOrAggregator instanceof InputValueDelayedParser) {
                aggregator = defaultOrAggregator
            } else {
                aggregator = new InputValueDelayedParser(actualParser, defaultOrAggregator)
            }
            aggregator.pushRawValue(value)
            return aggregator
        }
    }

    static prepareArguments(argumentsArray) {
        const rawArguments = []
        const parsedArgumentsFunc = []
        argumentsArray.forEach(arg => {
            if (arg instanceof InputValueDelayedParser) {
                rawArguments.push(...arg.rawValues())
                parsedArgumentsFunc.push(async () => await arg.parsedValue())
            } else {
                rawArguments.push(arg)
                parsedArgumentsFunc.push(async () => await arg)
            }
        })
        return {
            rawArguments,
            getArguments: async () => await Promise.all(parsedArgumentsFunc.map(cb => cb())),
        }
    }

    static prepareOptions(optionsObject) {
        const rawOptions = {}
        const parsedOptionsFunc = {}
        Object.entries(optionsObject).forEach(([key, opt]) => {
            if (opt instanceof InputValueDelayedParser) {
                rawOptions[key] = opt.rawValues()
                parsedOptionsFunc[key] = async () => await opt.parsedValue()
            } else {
                rawOptions[key] = opt
                parsedOptionsFunc[key] = async () => await opt
            }
        })

        return {
            rawOptions,
            getOptions: async () => Object.assign(
                {},
                ...await Promise.all(
                    Object.entries(parsedOptionsFunc).map(async ([key, cb]) => ({[key]: await cb()})),
                ),
            ),
        }
    }

    constructor(parser, defaultValue) {
        this._resolver = parser
        this._default = defaultValue
        this._rawValues = []
    }

    pushRawValue(value) {
        this._rawValues.push(value)
    }

    rawValues() {
        return this._rawValues
    }

    async parsedValue() {
        return await this._resolver(this._rawValues, this._default)
    }
}