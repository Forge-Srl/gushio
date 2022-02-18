#!/usr/bin/env gushio
export const run = async (args, options) => {
    const firstDelay = 250
    const secondDelay = 150
    const thirdDelay = Math.floor((firstDelay + secondDelay) / 2)

    const result = await timer.race([
        async signal => {
            await timer.sleep(firstDelay, undefined, {signal})
            console.log('Processing first')
            return await timer.sleep(200, 'first', {signal})
        },
        async signal => {
            await timer.sleep(secondDelay, undefined, {signal})
            console.log('Processing second')
            return await timer.sleep(200, 'second', {signal})
        },
        async signal => await timer.sleep(thirdDelay, 'third', {signal}),
    ])

    console.log(`the winner is: ${result}`)
}