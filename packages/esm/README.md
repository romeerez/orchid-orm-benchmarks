# ESM support

All orchid-orm related libraries are supporting ESM.

Add the following `module` specifier, as suggested by [TS docs](https://www.typescriptlang.org/docs/handbook/esm-node.html), to the `tsconfig.json` and it should finely work:

```json
{
  "compilerOptions": {
    "module": "nodenext"
  }
}
```
