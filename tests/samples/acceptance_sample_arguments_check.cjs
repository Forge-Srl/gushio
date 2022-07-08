#!/usr/bin/env gushio
module.exports = {
    cli: {
        arguments: [
            {name: '<first_argument>'},
            {name: '<second_argument>', parser: async ([value]) => value.toUpperCase()},
            {name: '<third_argument...>', default: 'def', parser: async (values, defaultValue) => `${values.join('--')}##${defaultValue}`},
        ]
    },
    run: async (args, options) => {
        console.log('These are the args: ' + JSON.stringify(args))
    },
}