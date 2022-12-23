---
sidebar_position: 5
---

# File System

You can access the file system directly using the `fs` object, which is a wrapper around
[`fs-extra`](https://www.npmjs.com/package/fs-extra):
```javascript
module.exports = {
    run: async () => {
        const myFile = await fs.readFile('./somefile.txt')
        console.log(myFile.toString())
    }
}
```

Additionally, Gushio provides `fs.glob`, a promisified version of [`glob`](https://www.npmjs.com/package/glob):
```javascript
module.exports = {
    run: async () => {
        const matches = await fs.glob('myPath/*.txt')
        console.log(matches)
    }
}
```

Also, instead of importing `path` you can simply access `fs.path`.

:::tip
If you need to refer to files relative to your script location, you can use the global variables `__filename` (the
absolute path of your script) and `__dirname` (the absolute path of the directory containing your script). These values
are available in both CJS and ESM scripts.
:::

:::danger
When a script is run from a remote url these two variables will assume the values `__filename = ''` and 
`__dirname = '.'`.
:::