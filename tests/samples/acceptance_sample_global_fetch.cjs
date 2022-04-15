#!/usr/bin/env gushio
module.exports = {
    cli: {
        arguments: [
            {name: '<url>', description: 'the url to fetch'}
        ]
    },
    run: async (args, options) => {
        const result = await fetch(args[0])
        console.log(`This is the remote resource: "${await result.text()}"`)
    },
}