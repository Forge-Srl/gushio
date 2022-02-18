const PENDING = Symbol('Pending promise')
const alwaysResolved = Promise.resolve(PENDING)
const isPromisePending = promise => Promise.race([promise, alwaysResolved]).then(v => v === PENDING, _ => false)

export const signalify = (asyncFunc) => async (...args) => {
    const {signal} = args.pop()

    if (signal.aborted) {
        throw new Error('Operation aborted')
    }

    const task = new AbortController()
    let aborted = false
    signal.addEventListener('abort', () => {aborted = true}, {once: true, signal: task.signal})

    const promiseFunc = asyncFunc(...args)
    while (!aborted && !signal.aborted && await isPromisePending(promiseFunc)) {
        await new Promise(resolve => {
            setImmediate(resolve)
        })
    }
    task.abort()

    if (signal.aborted || aborted) {
        throw new Error('Operation aborted')
    }

    try {
        return await promiseFunc
    } catch (e) {
        throw new Error(e)
    }
}

export const sleep = async (delay, value, {signal} = {}) => {
    if (signal && signal.aborted) {
        throw new Error('Operation aborted')
    }

    let capturedResolve, capturedReject
    const promise = new Promise((resolve, reject) => {
        capturedResolve = resolve
        capturedReject = reject
    })
    const task = new AbortController()
    const id = setTimeout(() => capturedResolve(value), delay)

    if (signal) {
        signal.addEventListener('abort', () => {
            clearTimeout(id)
            capturedReject('Operation aborted')
        }, {once: true, signal: task.signal})
    }

    try {
        const result = await promise
        task.abort()
        return result
    } catch (e) {
        task.abort()
        throw new Error(e)
    }
}

export const race = async (functions) => {
    const guardedFunctions = []
    const abortControllers = []
    const abortAllExcept = (index) => {
        for (let j = 0; j < abortControllers.length; j++) {
            if (index !== j) {
                abortControllers[j].abort()
            }
        }
    }
    for (let i = 0; i < functions.length; i++) {
        abortControllers[i] = new AbortController()
        guardedFunctions[i] = async () => {
            const currentSignal = abortControllers[i].signal
            try {
                const result = await functions[i](currentSignal)
                abortAllExcept(i)
                return result
            } catch (e) {
                if (currentSignal.aborted) {
                    throw new Error('Operation aborted')
                }
                abortAllExcept(i)
                throw e
            }
        }
    }

    return await Promise.race(guardedFunctions.map(f => f.apply()))
}