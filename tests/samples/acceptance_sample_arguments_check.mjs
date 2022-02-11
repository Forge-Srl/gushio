#!/usr/bin/env gushio
export const cli = {
    arguments: [
        {name: '<first_argument>'},
        {name: '<second_argument>'},
        {name: '<third_argument...>'},
    ],
}

export const run = async (args, options) => {
    console.log('These are the args: ' + JSON.stringify(args))
}
