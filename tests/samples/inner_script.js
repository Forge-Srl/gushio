#!/usr/bin/env gushio
module.exports = {
    cli: {
        arguments: [
            {name: '<arg1>'},
            {name: '<arg2>'}
        ],
        options: [
            {flags: '-a, --asd'},
            {flags: '-b, --bsd <value>'},
        ]
    },
    deps: [
        {name: 'is-odd'}
    ],
    run: async (args, options) => {
        console.log(`Inner script begin`)

        console.log('Global', myWarning)
        global.myWarning = 'changed'
        console.log('Arguments', args)
        console.log('Options', options)

        console.log(`Inner script end`)
    },
}