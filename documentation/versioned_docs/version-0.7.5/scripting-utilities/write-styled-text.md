---
sidebar_position: 1
---

# Write styled text

You can change output text color directly from the string itself. For example:
```javascript
module.exports = {
    run: async () => {
        console.log('Hello stylish world!'.blue.bold.italic)
    }
}
```
For a complete reference of the available styles see [`ansi-colors`](https://www.npmjs.com/package/ansi-colors).
