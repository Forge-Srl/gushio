#!/usr/bin/env gushio
module.exports = {
    cli: {
        arguments: [
            {name: '<first_argument>'},
            {name: '<second_argument>'},
            {name: '<third_argument...>'},
        ]
    },
    run: async (args, options) => {
        console.log('These are the args: ' + JSON.stringify(args))
    },
}