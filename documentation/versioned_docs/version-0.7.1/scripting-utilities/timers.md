---
sidebar_position: 7
---

# Timers

In case you need to wait some time or handle concurrent promises you can use the global object `timer`.

`timer.sleep()` is a promisified version of `setTimeout()` with support to `AbortController`:
```javascript
module.exports = {
    run: async () => {
        // Simple sleep
        await timer.sleep(500)
        
        // Sleep with result
        const myValue = await timer.sleep(1000, 'this is the resolved value')
        
        // Sleep with AbortController
        const controller = new AbortController()
        const sleepPromise = time.sleep(95000, 'the result', {signal: controller.signal})
        if (someCondition()) {
            controller.abort()
        } else {
            await sleepPromise
        }
    }
}
```

`timer.race()` is a wrapper around `Promise.race()` that internally use an AbortController to abort all the pending
promises after race ends:
```javascript
module.exports = {
    run: async () => {
        // Fetch Google only if it takes less than 500 millisecond
        const result = await timer.race([
            async signal => await timer.sleep(500, 'default', {signal}),
            async signal => await fetch('https://www.google.it', {signal})
        ])
    }
}
```

`timer.track()` is a utility function to add `AbortController` support to an existing async function:
```javascript
module.exports = {
    run: async () => {
        const someFunction = async (arg1, arg2, arg3) => { /*...*/ }

        const someFunctionWithAbort = timer.track(someFunction)

        const result = await timer.race([
            async signal => await timer.sleep(500, 'default', {signal}),
            async signal => await someFunctionWithAbort('value1', 'value2', 'value3', {signal})
        ])
    }
}
```