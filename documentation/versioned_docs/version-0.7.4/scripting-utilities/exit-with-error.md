---
sidebar_position: 8
---

# Exit with error

If you need to notify to the user the failure of your script you can simply throw an `Error` (possibly with an
informative message). Gushio will automatically print your message with `console.error()` and exit with code 1.
If you want to write more compact code, you can also throw the error message string directly, instead of creating an
`Error` object.

:::danger
Do not use `process.exit()` to make your script fail!
:::