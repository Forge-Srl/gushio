#!/usr/bin/env gushio
module.exports = {
    cli: {
        name: 'http-cat',
        description: 'Asks for an HTTP status code and prints the ASCII art of the relative cat',
        arguments: [
            {name: '[status-code]', description: 'The HTTP status code'}
        ]
    },
    deps: [
        {name: 'terminaltools', version: '2.1.0'}
    ],
    run: async (args, flags) => {
        const tools = await gushio.import('terminaltools')

        let statusCode = Number.parseInt(args[0])
        while (!Number.isInteger(statusCode) || statusCode < 0) {
            console.error('Status code must be a positive integer'.bgRed.white.bold)

            const input = await console.input({type: 'input', name: 'statusCode', message: 'Insert an HTTP status code'})
            statusCode = Number.parseInt(input.statusCode)
        }

        const statusCat = await console.spinner(fetch(`https://http.cat/${statusCode}.jpg`), 'Meowing')

        const asciiCat = await tools.image(await statusCat.arrayBuffer())

        console.log(`Here is your status ${statusCode} cat:\n`.blue.bold.italic)
        console.log(asciiCat)
        console.log('🐱 MEOW! 🐱')
    }
}
