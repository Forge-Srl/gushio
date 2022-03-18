---
sidebar_position: 9
---

# Gushio utilities

Gushio provides one additional global object `gushio` containing utilities and information about Gushio itself.

## Running version

`gushio.version` returns the version of Gushio running the script. The version is wrapped as a
[SemVer](https://www.npmjs.com/package/semver) object.

## Import libraries

`gushio.import()` allows to import external libraries in your script. For more information see
[Dependencies](../creating-script#dependencies).

## Run other scripts

With `gushio.run()` you can execute another gushio script. The target script runs in the same process of the "parent"
script and inherits its Gushio settings (folder, verbose mode, ...).
```javascript
module.exports = {
    run: async () => {
        await gushio.run('somePath/simpleScript.js')
        
        // the following notations are the same
        await gushio.run('somePath/myOtherScript.js', 'arg1 arg2 --flag "flag value 1" --other-flag')
        await gushio.run('somePath/myOtherScript.js', ['arg1', 'arg2', '--flag', 'flag value 1', '--other-flag'])
    }
}
```