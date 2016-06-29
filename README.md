# sync-json
Keep JSON files (or parts of them) in sync.

This module can be used to sync properties of config files like package.json or bower.json

```bash
$ sync-json -v --property version --source package.json app/package.json app/bower.json
Synchronising [version] from package.json...
 ✔ app/package.json
 ✔ app/bower.json
Successfully synchronised
```

## Installation

```
npm install -g sync-json
```

Alternatively it can be installed locally as a dependency with
```
npm install --save-dev sync-json
```

## Usage

### CLI

```
$ sync-json --help
Usage: sync-json [-p property] -s <source> <dest-files...>

Options:
  -p, --property  Each property to synchronize from source              [string]
  -s, --source    Source file                                [string] [required]
  -v, --verbose   Output message on success                            [boolean]
  -h, --help      Show help                                            [boolean]
  --version       Show version number                                  [boolean]
```

### Module

If installed as a dependency __sync-json__ could be required as a module that exposes a single function `syncJson`:

```javascript
const syncJson = require('sync-json');
```

#### - `syncJson(src, dst[, props], callback)`

__Arguments:__

1. __src__ `<string>` | `<object>`: The path to the source JSON or a JS object.
2. __dst__ `<string>` | `[<string>]`: Path or array of paths to the destination files.
3. __props__ `[<string>]`: _Optional_. List of properties from the source object to copy to the destionation files. If not specified, it will synchronise the whole `src` object.
4. __callback__ `<function>`: nodejs style callback.

```javascript
syncJson( 'package.json', ['app/package.json', 'app/bower.json'], ['version', 'contributors'], function(err){ ... });
```


## License

Copyright (c) 2016 [Josan Coba](https://github.com/Josan-Coba). Licensed under the MIT License (see [LICENSE](./LICENSE)).
