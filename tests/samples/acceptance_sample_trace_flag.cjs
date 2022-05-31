#!/usr/bin/env gushio
module.exports = {
    run: async (args, options) => {
        console.log('Simple line')

        const odd = []
        const even = []
        const others = []
        for (let i = 0; i < 10; i++) {
            let dummy
            if (i % 2) {
                odd.push(i)
            } else if (dummy = (i % 3 === 0)) {
                others.push(i)
            } else for (let j = 0; j < 2; j++) {
                even.push(i)
            }
            console.log(dummy)
        }

        for (let oddElement of odd) {
            console.log(`${oddElement} is odd`)
        }

        for (let otherElement of others)
            console.log(`${otherElement} is other`)

        let doWhileCounter = 0
        do {
            console.log(`${even[doWhileCounter]} is even`)
            doWhileCounter++
        } while (doWhileCounter < even.length)

        const obj = Object.assign({}, ...even.map((value, index) => ({[`key_${value}`]: odd[index]})))

        for (let objKey in obj) {
            console.log(`${objKey} -> ${obj[objKey]}`)
        }

        let whileCounter = 0
        let dummy2
        wh: while (true || (dummy2 = 3) > 2) {
            switch (whileCounter) {
                case 3:
                    console.log('trinity!')
                case 1:
                case 2:
                case 4:
                    console.log(`value is ${whileCounter}`)
                    break
                case 7:
                    break wh
                default:
                    console.log('Ops!')
            }

            whileCounter++
            console.log(dummy2)
        }

        async function* generator() {
            yield 0
            yield 1
            yield await new Promise(resolve => setTimeout(() => resolve(2), 500))
            yield* others
        }

        for await (let generatorElement of generator()) {
            console.log(`generator -> ${generatorElement}`)
        }
    },
}