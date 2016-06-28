# sync-json
Keep JSON files (or parts of them) in sync.

This module can be used to sync properties of config files like package.json or bower.json

```bash
$ sync-json --property version --source package.json app/package.json app/bower.json
Synchronising [version] from package.json...
 ✔ app/package.json
 ✔ app/bower.json
Successfully synchronised
```

## License

Copyright (c) 2016 [Josan Coba](https://github.com/Josan-Coba). Licensed under the MIT License (see [LICENSE](./LICENSE)).
