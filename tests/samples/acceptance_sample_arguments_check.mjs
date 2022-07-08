#!/usr/bin/env gushio
export const cli = {
    arguments: [
        {name: '<first_argument>'},
        {name: '<second_argument>', parser: async ([value]) => value.toUpperCase()},
        {name: '<third_argument...>', default: 'def', parser: async (values, defaultValue) => `${values.join('--')}##${defaultValue}`},
    ],
}

export const run = async (args, options) => {
    console.log('These are the args: ' + JSON.stringify(args))
}
