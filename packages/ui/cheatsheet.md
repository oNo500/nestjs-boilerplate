## Installation & Override

```bash

# Update and overwrite already installed components
ls ./src/components | sed 's/.tsx//' | xargs npx shadcn@latest add -o
```