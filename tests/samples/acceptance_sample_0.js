#!/usr/bin/gushio
/*
* WARNING:
* This sample specifically contains errors in order to test how Gushio behaves in such situation
* */

In this line there's JavaScript syntax error

module.exports = {
    run: async (args, options) => {
        console.log('This line will never be executed')
    },
}