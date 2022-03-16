---
sidebar_position: 2
---

# Creating a script

A Gushio script file is a standard JavaScript file which exports an asynchronous `run` function. You can use both ESM
```javascript
export const run = async () => {
    console.log('Hello world!')
}
```
or CJS
```javascript
module.exports = {
    run: async () => {
        console.log('Hello world!')
    }
}
```

## Dependencies

You can use NPM packages in your Gushio script. All dependencies are automatically downloaded by the Gushio runner and
**they are available for import using `await gushio.import()` only inside the `run()` function**. Importing a dependency
outside such function will fail.

To add a dependency to your script, you need to export a `deps` array like this:
```javascript
module.exports = {
    deps: [
        {name: 'my-dependecy'}
    ],
    run: async () => {
        await gushio.import('my-dependency')
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
        const {default: isOdd} = await gushio.import('is-odd')
        const {default: old_isOdd} = await gushio.import('old-odd')
        console.log('15 is odd: ' + isOdd(15))
        console.log('15 was odd: ' + old_isOdd(15))
    }
}
```

When you provide an `alias`, the dependency is accessible via such string, otherwise the dependency `name` is used.

> Here are some examples of libraries you can add to superpower your scripts:
> - [simple-git](https://www.npmjs.com/package/simple-git) for Git;
> - [jimp](https://www.npmjs.com/package/jimp) for image processing;
> - [dockerode](https://www.npmjs.com/package/dockerode) for Docker;
> - [aws-sdk](https://www.npmjs.com/package/aws-sdk) for AWS.

### Default dependencies

By default, Gushio provides [`shelljs`](https://www.npmjs.com/package/shelljs), a portable implementation of unix shell
commands (it is available via `await gushio.import('shelljs')`).

## Arguments

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

The values of the arguments are provided as an array in the first parameter of the `run` function.

## Options

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

The values of the flags are provided as an object in the second parameter of the `run` function.

## Script metadata

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