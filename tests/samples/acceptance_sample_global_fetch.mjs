#!/usr/bin/env gushio
export const cli = {
    arguments: [
        {name: '<url>', description: 'the url to fetch'},
    ],
}
export const run = async (args, options) => {
    const result = await fetch(args[0])
    console.log(`This is the remote resource: "${await result.text()}"`)
}