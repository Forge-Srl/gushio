export class FunctionWrapper {
    static combine(...wrappers) {
        const before = async () => {
            for (let i = 0; i < wrappers.length; i++) {
                await wrappers[i].before()
            }
        }
        const after = async () => {
            for (let i = wrappers.length - 1; i >= 0; i--) {
                await wrappers[i].after()
            }
        }
        return new FunctionWrapper(before, after)
    }

    constructor(before, after) {
        this.before = before
        this.after = after
    }

    async run(fn) {
        await this.before()
        const result = await fn()
        await this.after()
        return result
    }
}