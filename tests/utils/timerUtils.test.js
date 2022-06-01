import {jest, describe, test, beforeAll, beforeEach, afterEach, afterAll, expect} from '@jest/globals'

describe('runUtils', () => {
    let race, sleep, signalify

    beforeEach(async () => {
        race = (await import('../../utils/timerUtils.js')).race
        sleep = (await import('../../utils/timerUtils.js')).sleep
        signalify = (await import('../../utils/timerUtils.js')).signalify
    })

    describe('sleep', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        test('without signal', async () => {
            const lazy = async (fn) => {
                const value = await sleep(20000, 'result')
                return fn(value)
            }
            const fn = jest.fn().mockImplementationOnce(() => 'invoked')
            const promise = lazy(fn)

            expect(fn).not.toHaveBeenCalled()
            jest.advanceTimersByTime(4000)
            expect(fn).not.toHaveBeenCalled()
            jest.advanceTimersByTime(12000)
            expect(fn).not.toHaveBeenCalled()
            jest.advanceTimersByTime(5000)

            expect(await promise).toBe('invoked')
            expect(fn).toHaveBeenCalledWith('result')
        }, 1000)

        test('with signal', async () => {
            const controller = new AbortController()
            const lazy = async (fn) => {
                const value = await sleep(20000, 'result', {signal: controller.signal})
                return fn(value)
            }
            const fn = jest.fn().mockImplementationOnce(() => 'invoked')
            const promise = lazy(fn)

            expect(fn).not.toHaveBeenCalled()
            jest.advanceTimersByTime(4000)
            controller.abort()
            jest.runAllTimers()

            await expect(promise).rejects.toThrow(new Error('Operation aborted'))
            expect(fn).not.toHaveBeenCalled()
        }, 1000)

        test('with signal already aborted', async () => {
            const controller = new AbortController()
            const lazy = async (fn) => {
                const value = await sleep(20000, 'result', {signal: controller.signal})
                return fn(value)
            }
            const fn = jest.fn()
            controller.abort()

            const promise = lazy(fn)

            expect(fn).not.toHaveBeenCalled()
            jest.runAllTimers()

            await expect(promise).rejects.toThrow(new Error('Operation aborted'))
            expect(fn).not.toHaveBeenCalled()
        }, 1000)
    })

    describe('signalify', () => {
        let signalizedFunc, innerPromise, innerPromiseResolve, innerPromiseReject, mockFn

        beforeEach(() => {
            innerPromise = new Promise((resolve, reject) => {
                innerPromiseResolve = resolve
                innerPromiseReject = reject
            })
            mockFn = jest.fn()
            signalizedFunc = signalify(async (param1, param2) => {
                await innerPromise
                mockFn(param1, param2)
                return 'asyncResult'
            })
        })

        test('signal already aborted', async () => {
            const controller = new AbortController()
            controller.abort()
            const signalizedPromise = signalizedFunc('foo', 'bar', {signal: controller.signal})
            await expect(signalizedPromise).rejects.toThrow(new Error('Operation aborted'))
            expect(mockFn).not.toHaveBeenCalled()
        })

        test('signal abort after invocation', async () => {
            const controller = new AbortController()
            const signalizedPromise = signalizedFunc('foo', 'bar', {signal: controller.signal})
            controller.abort()
            await expect(signalizedPromise).rejects.toThrow(new Error('Operation aborted'))
            expect(mockFn).not.toHaveBeenCalled()
        })

        test('promise resolves', async () => {
            const controller = new AbortController()
            const signalizedPromise = signalizedFunc('foo', 'bar', {signal: controller.signal})

            innerPromiseResolve()
            expect(await signalizedPromise).toBe('asyncResult')
            expect(mockFn).toHaveBeenCalledWith('foo', 'bar')
        })

        test('promise rejects', async () => {
            const controller = new AbortController()
            const signalizedPromise = signalizedFunc('foo', 'bar', {signal: controller.signal})

            innerPromiseReject('kaboom')
            await expect(signalizedPromise).rejects.toThrow(new Error('kaboom'))
            expect(mockFn).not.toHaveBeenCalled()
        })
    })

    describe('race', () => {

        test('single function resolves', async () => {
            const promise = race([
                async signal => 3
            ])

            expect(await promise).toBe(3)
        })

        test('single function rejects', async () => {
            const promise = race([
                async signal => { throw new Error('666') }
            ])

            await expect(promise).rejects.toThrow(new Error('666'))
        })

        test('multiple function instant resolve keeps first', async () => {
            for (let run = 0; run < 100; run++) {
                const promise = race([
                    async signal => `r${run}_1`,
                    async signal => `r${run}_2`,
                    async signal => `r${run}_3`,
                ])

                expect(await promise).toBe(`r${run}_1`)
            }
        })

        test('multiple function instant reject keeps first', async () => {
            for (let run = 0; run < 100; run++) {
                const promise = race([
                    async signal => { throw new Error(`r${run}_1`) },
                    async signal => { throw new Error(`r${run}_2`) },
                    async signal => { throw new Error(`r${run}_3`) },
                ])

                await expect(promise).rejects.toThrow(new Error(`r${run}_1`))
            }
        })

        test('signal stops other promises', async () => {
            const makeWait = (onAbort) => async signal => {
                signal.addEventListener('abort', onAbort, {once: true})
                const pendingPromise = new Promise(() => {})
                return await pendingPromise
            }

            for (let run = 0; run < 100; run++) {
                const mockFn1 = jest.fn()
                const mockFn2 = jest.fn()
                const mockFn3 = jest.fn()
                const mockFn4 = jest.fn()
                const promise = race([
                    async signal => `r${run}_1`,
                    makeWait(mockFn1),
                    makeWait(mockFn2),
                    makeWait(mockFn3),
                    makeWait(mockFn4),
                ].sort(() => Math.ceil(Math.random() * 10) - 5))

                expect(await promise).toBe(`r${run}_1`)
                expect(mockFn1).toHaveBeenCalled()
                expect(mockFn2).toHaveBeenCalled()
                expect(mockFn3).toHaveBeenCalled()
                expect(mockFn4).toHaveBeenCalled()
            }
        })

        test('lowest sleep time wins', async () => {
            for (let run = 0; run < 50; run++) {
                const functions = []
                const mocks = []
                const times = []
                let lowestTime, lowestIndex
                for (let index = 0; index < 10; index++) {
                    times.push(Math.ceil(Math.random() * 15 + 10) * 10)
                    mocks.push(jest.fn().mockImplementationOnce(() => `result_${index}`))
                    functions.push(async signal => {
                        const result = await sleep(times[index], `r${run}_${index}`, {signal})
                        return mocks[index](result)
                    })

                    if (!lowestTime || times[index] < lowestTime) {
                        lowestTime = times[index]
                        lowestIndex = index
                    }
                }

                const promise = race(functions)
                try {
                    expect(await promise).toBe( `result_${lowestIndex}`)
                    expect(mocks[lowestIndex]).toHaveBeenCalledWith(`r${run}_${lowestIndex}`)
                    for (let index = 0; index < mocks.length; index++){
                        const mock = mocks[index]
                        if (index === lowestIndex) {
                            expect(mock).toHaveBeenCalledWith(`r${run}_${lowestIndex}`)
                        } else {
                            expect(mock).not.toHaveBeenCalled()
                        }
                    }
                } catch (e) {
                    console.error(times)
                    throw e
                }
            }
        }, 10000)
    })
})