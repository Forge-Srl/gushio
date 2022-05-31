---
sidebar_position: 4
---

# Running a script

To run a Gushio script pass the script to the `gushio` executable. If your script needs arguments and/or options, you
can pass them after the script path.

```shell
gushio path/to/script_file.js arg1 arg2 --option1 foo --option2 bar baz bau
```

You can also run remote scripts directly: if the script path is a URL, the `gushio` executable automatically retrieves
the remote code before running it.

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

## Gushio flags

Gushio can receive options before the script argument. The following options are available:
- `-v`, `--verbose` enable verbose logging (also available by setting `GUSHIO_VERBOSE` environment variable).
- `--trace` enable instruction tracing (also available by setting `GUSHIO_TRACE` environment variable).
- `-f <folder>`, `--gushio-folder <folder>` change gushio cache folder (also available by setting `GUSHIO_FOLDER`
  environment variable). The default value is the `.gushio` folder in the user home directory.
- `-c`, `--clean-run` clear gushio cache folder before running the script (dependencies will be re-downloaded).