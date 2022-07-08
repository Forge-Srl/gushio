#!/usr/bin/env gushio
module.exports = {
    cli: {
        options: [
            {flags: '-f, --first <first_argument>'},
            {flags: '-s, --second <second_argument...>', default: 5, parser: async (values, defaultValue) => values.map(v => Number.parseInt(v)).reduce((v, agg) => v + agg, defaultValue)},
            {flags: '-t, --third'},
        ]
    },
    run: async (args, options) => {
        console.log('These are the options: ' + JSON.stringify(options))
    },
}