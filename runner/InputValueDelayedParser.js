export class InputValueDelayedParser {
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