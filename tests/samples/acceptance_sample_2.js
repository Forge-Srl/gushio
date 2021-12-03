#!/usr/bin/gushio -s
module.exports = {
    run: async ({'shelljs': $, 'ansi-colors': c, 'enquirer': e}, args, options) => {
        throw new Error('This script can fail badly')
    },
}