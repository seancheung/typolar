#!/usr/bin/env node
const program = require('commander')
const chalk = require('chalk')

class HandledError extends Error {}

program
    .version('0.1.0')
    .option('-w, --wrokdir <dir>', 'change work directory')
    .option('--config <filepath>', 'set config filepath')
    .option('-v, --verbose', 'enable verbose output')

program
    .command('create <name>')
    .description('create a new app')
    .option('--no-tslint', 'no tslint integration')
    .option('--no-prettier', 'no prettier integration')
    .option('--docs', 'add documentation generator')
    .option('--vscode', 'add vscode integration')
    .option('--convention', 'file name convention', 'spinalcase')
    .option('--no-install', 'skip npm install')
    .option('--no-init', 'skip git init')
    .option('--no-hide', 'do not hide config files in vscode')
    .action(env)
    .action(wrap(create))

const commands = program.commands.map(cmd => cmd._name)

program.parse(process.argv)

if (
    commands.indexOf(program.args[0]) < 0 &&
    !(program.args[program.args.length - 1] instanceof program.Command)
) {
    if (program.args.length > 0) {
        console.error(
            chalk.red('Unknown Command: ' + chalk.bold(program.args.join(' ')))
        )
    }
    program.help()
}

function env() {
    if (program.verbose) {
        process.env.VERBOSE = 'true'
    }
    if (program.wrokdir) {
        process.chdir(program.wrokdir)
        console.log(
            chalk.yellow(
                `workdir changed to ${chalk.bold(chalk.blue(process.cwd()))}`
            )
        )
    }

    process.on('uncaughtException', err => {
        console.error('[uncaughtException]', err)
    })

    process.on('unhandledRejection', (reason, p) => {
        console.error('[unhandledRejection]', p, reason)
    })

    process.on('warning', warning => {
        console.warn('[warning]', warning)
    })
}

function wrap(func) {
    return async (...args) => {
        try {
            await func(...args)
        } catch (error) {
            if (error instanceof HandledError) {
                console.error(chalk.red(error.message))
            } else {
                const util = require('util')
                console.error(chalk.red(util.inspect(error, false, null, true)))
            }
            process.exit(1)
        }
    }
}

function exec(dir, command, ...args) {
    const spawn = require('cross-spawn')
    const path = require('path')
    const res = spawn.sync(command, args, {
        cwd: path.resolve(process.cwd(), dir),
        stdio: 'inherit'
    })
    if (res.error) {
        throw res.error
    }
}

function replace(str, envs) {
    return str.replace(/\$\{(.+?)\}/g, (_, k) => {
        if (k in envs) {
            return envs[k]
        }
        return _
    })
}

function splice(array, match) {
    if (typeof match !== 'function') {
        const val = match
        match = i => i === val
    }
    if (Array.isArray(array)) {
        let index = array.findIndex(match)
        while (index >= 0) {
            array.splice(index, 1)
            index = array.findIndex(match)
        }
    } else {
        Object.keys(array).forEach(key => {
            if (match(key)) {
                delete array[key]
            }
        })
    }
}

function load(src, text, envs) {
    const fs = require('fs')
    const path = require('path')
    let content = fs.readFileSync(path.resolve(__dirname, src), 'utf8')
    if (text && typeof text === 'object') {
        envs = text
        text = false
    }
    if (envs) {
        content = replace(content, envs)
    }
    return text ? content : JSON.parse(content)
}

function copy(src, tar) {
    const fs = require('fs')
    const path = require('path')
    fs.copyFileSync(
        path.resolve(__dirname, src),
        path.resolve(process.cwd(), tar)
    )
}

function write(tar, src) {
    const fs = require('fs')
    const path = require('path')
    if (typeof src !== 'string') {
        src = JSON.stringify(src, null, 2)
    }
    fs.writeFileSync(path.resolve(process.cwd(), tar), src, {
        encoding: 'utf8'
    })
}

function create(dir, options) {
    const fs = require('fs')
    const path = require('path')
    if (fs.existsSync(dir)) {
        if (fs.readdirSync(dir).length > 0) {
            throw new HandledError(
                `directory ${chalk.yellow(dir)} is not empty`
            )
        }
    } else {
        fs.mkdirSync(dir)
    }
    const rc = {
        name: path.basename(dir),
        tslint: !!options.tslint,
        prettier: !!options.prettier,
        convention: 'spinalcase',
        vscode: !!options.vscode,
        docs: !!options.docs
    }
    write(path.join(dir, '.typolarrc'), rc)
    const dirs = {
        src: 'src',
        models: 'src/models',
        routes: 'src/routes',
        services: 'src/services',
        config: 'config',
        views: 'views',
        tests: 'tests',
        build: 'lib'
    }
    if (rc.docs) {
        Object.assign(dirs, {
            docs: 'docs'
        })
    }
    for (const key in dirs) {
        fs.mkdirSync(path.join(dir, dirs[key]))
    }
    const envs = Object.assign({ name: rc.name }, dirs)
    const package = load('stubs/package.json.stub', envs)
    if (!rc.tslint) {
        splice(package.devDependencies, key => /tslint/.test(key))
        splice(package.scripts, key => /lint|pretest/.test(key))
    } else {
        const config = load('stubs/tslint.json.stub', envs)
        if (!rc.prettier) {
            splice(config.extends, item => /prettier/.test(item))
        }
        if (!rc.docs) {
            splice(config.linterOptions.exclude, item => /docs/.test(item))
        }
        write(path.join(dir, 'tslint.json'), config)
    }
    if (!rc.prettier) {
        splice(package.devDependencies, key => /prettier/.test(key))
        splice(package.scripts, key => /prettier|format/.test(key))
    } else {
        copy('stubs/prettierrc.stub', path.join(dir, '.prettierrc'))
        let ignore = load('stubs/prettierignore.stub', true, envs)
        if (!rc.docs) {
            ignore = ignore.split('\n')
            splice(ignore, line => /docs/.test(line))
            ignore = ignore.join('\n')
        }
        write(path.join(dir, '.prettierignore'), ignore)
    }
    if (!rc.docs) {
        splice(package.devDependencies, key => /typedoc/.test(key))
        splice(package.scripts, key => /docs/.test(key))
    }
    // tsconfig
    const dev = load('stubs/tsconfig.json.stub', true, envs)
    write(path.join(dir, 'tsconfig.json'), dev)
    // tsconfig.prod
    const prod = load('stubs/tsconfig.prod.json.stub', true, envs)
    write(path.join(dir, 'tsconfig.prod.json'), prod)
    // package
    write(path.join(dir, 'package.json'), package)
    // gitignore
    copy('stubs/gitignore.stub', path.join(dir, '.gitignore'))
    // env
    copy('stubs/env.template.stub', path.join(dir, '.env'))
    copy('stubs/env.template.stub', path.join(dir, '.env.template'))
    // config
    const app = load('stubs/config/app.json.stub', true, envs)
    write(path.join(dir, dirs.config, 'app.json'), app)
    copy(
        'stubs/config/logger.json.stub',
        path.join(dir, dirs.config, 'logger.json')
    )
    // vscode
    if (rc.vscode) {
        const vscode = path.join(dir, '.vscode')
        fs.mkdirSync(vscode)
        // extensions
        const extensions = load('stubs/vscode/extensions.json.stub')
        if (!rc.prettier) {
            splice(extensions, item => /prettier/.test(extensions))
        }
        if (!rc.tslint) {
            splice(extensions, item => /tslint/.test(extensions))
        }
        write(path.join(vscode, 'extensions.json'), extensions)
        // launch
        const launch = load('stubs/vscode/launch.json.stub', true, envs)
        write(path.join(vscode, 'launch.json'), launch)
        // settings
        const settings = load('stubs/vscode/settings.json.stub', envs)
        if (!options.hide) {
            splice(settings['files.exclude'], key => !/node_modules/.test(key))
        } else {
            if (!rc.tslint) {
                splice(settings['files.exclude'], key => /tslint/.test(key))
            }
            if (!rc.prettier) {
                splice(settings['files.exclude'], key => /prettier/.test(key))
            }
        }
        if (!rc.docs) {
            splice(settings['files.watcherExclude'], key => /docs/.test(key))
            splice(settings['search.exclude'], key => /docs/.test(key))
        }
        write(path.join(vscode, 'settings.json'), settings)
        //tasks
        const tasks = load('stubs/vscode/tasks.json.stub', envs)
        if (!rc.docs) {
            splice(tasks.tasks, task => /docs/.test(task.label))
        }
        if (!rc.tslint) {
            splice(tasks.tasks, task => /lint/.test(task.label))
        }
        if (!rc.prettier) {
            splice(tasks.tasks, task => /format/.test(task.label))
        }
        write(path.join(vscode, 'tasks.json'), tasks)
    }

    if (options.install) {
        exec(dir, 'npm', 'i')
    }
    if (options.init) {
        exec(dir, 'git', 'init')
    }
}
