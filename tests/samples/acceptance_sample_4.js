#!/usr/bin/gushio
module.exports = {
    cli: {
        options: [
            {flags: '-f, --first <first_argument>'},
            {flags: '-s, --second <second_argument...>'},
            {flags: '-t, --third'},
        ]
    },
    run: async (args, options) => {
        console.log('These are the options: ' + JSON.stringify(options))
    },
}