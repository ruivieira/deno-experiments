# Docker utilities

## containerise

To build:

```shell
deno bundle containerise.ts > containerise.js
deno compile -A --unstable containerise.js
```

Use with

```shell
./containerise --entry scratch/app.ts
```