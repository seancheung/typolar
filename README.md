# Typolar

A simple typescript framework

## Install

Recommended CLI tool: [typolar-cli](https://github.com/seancheung/typolar-cli)

## Usage

### App

```typescript
import Application from 'typolar'
const app = new Application()
app.start()
```

### Config

```typescript
import { config } from 'typolar'
```

### Model

e.g. src/models/user.ts

```typescript
import { injectable, Model } from 'typolar'

@injectable
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

## Test

```bash
npm test
```

## License

See [License](https://github.com/seancheung/typolar/blob/master/LICENSE)
