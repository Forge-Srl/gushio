#!/usr/bin/env gushio
export const cli = {
    options: [
        {flags: '-f, --first <first_argument>'},
        {flags: '-s, --second <second_argument...>'},
        {flags: '-t, --third'},
    ],
}
export const run = async (args, options) => {
    console.log('These are the options: ' + JSON.stringify(options))
}