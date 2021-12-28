# Gushio

*Like bash scripts, but in JavaScript!*

[![Build Gushio](https://github.com/Forge-Srl/gushio/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/Forge-Srl/gushio/actions/workflows/build.yml)

Gushio* is built on top of battle-tested libraries like [commander](https://www.npmjs.com/package/commander) and 
[shelljs](https://www.npmjs.com/package/shelljs) and allows you to write a multiplatform shell script in a single 
JavaScript file without having to worry about `package.json` and dependencies installation.

<sub>_* Gushio is pronounced like the italian word "guscio" (IPA: /'guʃʃo/) which means "shell"._</sub>

## Installation

Install with npm:

```shell
npm install -g gushio
```

## Usage

### Creating a Gushio script

A Gushio script file is a standard JavaScript file which exports an asynchronous `run` function:
```javascript
module.exports = {
    run: async () => {
        console.log('Hello world!')
    }
}
```

#### Scripting utilities

The code executed inside the `run` function has access to some special utilities which are not available in a standard
Node.js context.

##### Write styled text

You can change output text color directly from the string itself. For example:
```javascript
module.exports = {
    run: async () => {
        console.log('Hello stylish world!'.blue.bold.italic)
    }
}
```
For a complete reference of the available styles see [`ansi-colors`](https://www.npmjs.com/package/ansi-colors).

##### Read user input

You can read user input with `console.input()`. For example:
```javascript
module.exports = {
    run: async () => {
        const userInput = await console.input(
            {type: 'input', name: 'username', message: 'Tell me your username'},
            {type: 'input', name: 'email', message: 'And your email address'}
        )
        console.log(`Your name is "${userInput.name}" and your email address is <${userInput.email}>`)
    }
}
```
For a complete reference of the available input types and configurations see 
[`enquirer`](https://www.npmjs.com/package/enquirer).

##### HTTP(S) requests

You can make HTTP and HTTPS requests directly using `fetch`, which is a wrapper around 
[`node-fetch`](https://www.npmjs.com/package/node-fetch):
```javascript
module.exports = {
    run: async () => {
        const googleHomePage = await fetch('https://www.google.com')
        console.log(await googleHomePage.text())
    }
}
```

#### Dependencies

You can use NPM packages in your Gushio script. All dependencies are automatically downloaded by the Gushio runner and 
**they are available for `require()` only inside the `run()` function**. Requiring a dependency outside such function 
will lead to unknown results (probably an error will be thrown).

To add a dependency to your script, you need to export a `deps` array like this:
```javascript
module.exports = {
    deps: [
        {name: 'my-dependecy'}
    ],
    run: async () => {
        require('my-dependency')
        //...
    }
}
```

For each dependency you must specify the name (as found on NPM). You can add a `version` field to specify the version of
the dependency you desire. When it is not specified, the `latest` version of that package is used.

Additionally, you can specify an `alias` field to use multiple versions of the same module:
```javascript
module.exports = {
    deps: [
        {name: 'is-odd', version: '^3.0.1'},
        {name: 'is-odd', version: '1.0.0', alias: 'old-odd'},
    ],
    run: async () => {
        const isOdd = require('is-odd')
        const old_isOdd = require('old-odd')
        console.log('15 is odd: ' + isOdd(15))
        console.log('15 was odd: ' + old_isOdd(15))
    }
}
```

When you provide an `alias`, the dependency is accessible via such string, otherwise the dependency `name` is used.

##### Default dependencies

By default, Gushio provides [`shelljs`](https://www.npmjs.com/package/shelljs), a portable implementation of unix shell 
commands (it is available via `require('shelljs')`).

#### Arguments

If your script needs some arguments, you can specify them in the `cli` object:
```javascript
module.exports = {
    cli: {
        arguments: [
            {name: '<quix>', description: 'the first argument'},
            {name: '<layout>', choices: ['qwerty', 'dvorak']},
            {name: '[quak]', description: 'the third (and optional) argument', default: 69420}
        ]
    },
    run: async (args, options) => {
        const [quix, quak] = args
        //...
    }
}
```

Use angular brackets (`<>`) for required arguments and square brackets (`[]`) for optional arguments. For each argument
you can add a `description` to be shown in the help and a `default` value to be used when the argument is not provided.
You can also allow a limited set of values by adding a `choices` array of strings.

The last argument (and only the last argument) can also be variadic (can receive multiple values) by appending `...` to
its name:
```javascript
module.exports = {
    cli: {
        arguments: [
            {name: '<quix>', description: 'the first argument'},
            {name: '[quaks...]', description: 'the last argument (can have many values)'}
        ]
    }
}
```

The values of the arguments are provided as an array in the second parameter of the `run` function.

#### Options

If your script needs some flags, you can specify them in the `cli` object:
```javascript
module.exports = {
    cli: {
        options: [
            {flags: '-f, --foo', description: 'the foo flag (boolean)'},
            {flags: '-b, --bar [broom]', description: 'the bar flag (optional)', default: 'no_broom', env: 'MY_BAR'},
            {flags: '-B, --baz <baam>', description: 'the baz flag', choices: ['swish', 'swoosh']},
        ],
    },
    run: async (args, options) => {
        const {foo, bar, baz} = options
        //...
    }
}
```

Use angular brackets (`<>`) for required flag values and square brackets (`[]`) for optional flag values. If you need a
boolean flag don't add a flag argument. For each flag you can add:
- a `description` to be shown in the help;
- a `default` value to be used when the flag is not provided;
- a `choices` array of strings to allow only a limited set of values;
- a `env` variable name to read the value from (if the flag is not provided, then the environment variable is checked; 
  if such variable is not set, then the default value is used).

An option can also be variadic (can receive multiple values) by appending `...` to its argument name:
```javascript
module.exports = {
    cli: {
        options: [
            {flags: '-B, --baz <values...>', description: 'the baz flag (multiple values allowed)'},
        ],
    }
}
```

The values of the flags are provided as an object in the third parameter of the `run` function.

#### Script metadata

In the `cli` object you can also add some metadata which can be displayed in the script help:
```javascript
module.exports = {
    cli: {
        name: 'my-awesome-script',
        description: 'An awesome description of what this script does',
        version: '4.2.0',
        afterHelp: 'This string will be shown after the script help',
    },
    run: async (args, options) => {
        //...
    }
}
```

### Running a Gushio script

To run a Gushio script pass the script to the `gushio` executable. If your script needs arguments and/or options, you 
can pass them after the script path.

```shell
gushio path/to/script_file.js arg1 arg2 --option1 foo --option2 bar baz bau
```

On Linux and macOS you can also run the script directly:
1. Add the shabang to the script (`#!/usr/bin/gushio` or `#!/usr/bin/env gushio`)
2. Make the script executable
   ```shell
   chmod +x path/to/script_file.js
   ```
3. Run the script
   ```shell
   path/to/script_file.js arg1 arg2 --option1 foo --option2 bar baz bau
   ```

#### Gushio flags

Gushio can receive options before the script argument. The following options are available:
- `-v`, `--verbose` enable verbose logging (also available by setting `GUSHIO_VERBOSE` environment variable).
- `-f <folder>`, `--gushio-folder <folder>` change gushio cache folder (also available by setting `GUSHIO_FOLDER` 
  environment variable). The default value is the `.gushio` folder in the user home directory.
- `-c`, `--clean-run` clear gushio cache folder before running the script (dependencies will be re-downloaded).

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).