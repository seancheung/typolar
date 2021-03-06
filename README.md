# Typolar

[![Master Build][travis-master]][travis-url]
[![Develop Build][travis-develop]][travis-url]

A simple typescript framework

[travis-master]: https://img.shields.io/travis/seancheung/typolar/master.svg?label=master
[travis-develop]: https://img.shields.io/travis/seancheung/typolar/develop.svg?label=develop
[travis-url]: https://travis-ci.org/seancheung/typolar

## Install

Recommended CLI tool: [typolar-cli](https://github.com/seancheung/typolar-cli)

## Usage

### App

```typescript
import Application from 'typolar'
const app = new Application(__dirname)
app.start()
```

Hooks:

-   beforeLoad
-   beforeSetup
-   beforeMount
-   afterMount
-   afterSetup

```typescript
const app = new Application(__dirname, {
    beforeMount(app) {
        app.use(/*...*/)
    }
})
```

### Config

```typescript
import config from 'typolar/config'
const tag = config.app.tag
```

### Model

e.g. src/models/user.ts

```typescript
import { Model } from 'typolar'

export default class User extends Model {
    // TODO: define user model
}
```

### Controller

e.g. src/routes/user.ts

```typescript
import { Controller, guards, route } from 'typolar'
import { Next, Request, Response } from 'typolar/types'

@route('user')
export default class UserController extends Controller {
    @route('/:id', [guards.params({ id: 'user id' })])
    getUser(req: Request, res: Response, next: Next) {
        // TODO: handle request
        res.json({ id: req.params.id })
    }

    @route('/', 'post', [guards.fields({ name: 'user name' })])
    createUser(req: Request, res: Response, next: Next) {
        // TODO: handle request
        res.json({ name: req.body.name })
    }
}
```

### Service

```typescript
import { Service } from 'typolar'
import { Contract } from 'typolar/types'

export class UserService extends Service<Contract> {
    /**
     * Get user by id
     *
     * @param id user id
     */
    getUser(id: number) {
        // TODO: handle service request
        return this._get('/user/api/path', { id })
    }
}

export default UserService.create() as UserService
```

### Logging

```typescript
import { getLogger } from 'typolar'
const logger = getLogger('category')
logger.info('...')
```

### Errors

```typescript
import { errors } from 'typolar'
```

### Cache

```typescript
import cache from 'typolar/cache'
```

### JWT

```typescript
import jwt from 'typolar/jwt'
```

### IoC

```typescript
import { register, fetch, flush } from 'typolar/ioc'

// decorator registration
@register()
class MyClass {}

// inline registration
register(AnotherClass)
// instance registration
register(AnotherClass, new AnotherClass())

// fetch registered
const myCLass = fetch(MyClass)
const another = fetch(Another)
// fetch unregistered(if not registerd already, make a inline registration). lazy registration
const third = fetch(ThirdClass)
// bypass auto registration(might return undefined if not registered already)
const fourth = fetch(FourthClass, false)

// flush all registered
flush()
// flush target type
flush(MyClass)
```

## Test

```bash
npm test

```

## License

See [License](https://github.com/seancheung/typolar/blob/master/LICENSE)
