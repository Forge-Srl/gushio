class FunctionRunner {
    static combine(...patches) {
        const before = async () => {
            for (let i = 0; i < patches.length; i++) {
                await patches[i].before()
            }
        }
        const after = async () => {
            for (let i = patches.length - 1; i >= 0; i--) {
                await patches[i].after()
            }
        }
        return new FunctionRunner(before, after)
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

module.exports = {FunctionRunner}