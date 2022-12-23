---
sidebar_position: 2
---

# Await with spinners

You can await a long promise to resolve while showing a spinner with `console.spinner()`. For example:
```javascript
module.exports = {
    run: async () => {
        const myPromise = someLongOperation()
        const promiseResult = await console.spinner(myPromise, 'Performing a long task')
    }
}
```
:::tip

In order to work correctly, you must `await` only the spinner, not the promise!

:::

`console.spinner()` is a wrapper around [`ora`](https://www.npmjs.com/package/ora); check that for a complete reference.
