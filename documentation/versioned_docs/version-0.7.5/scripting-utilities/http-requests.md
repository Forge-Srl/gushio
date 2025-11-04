---
sidebar_position: 4
---

# HTTP requests

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