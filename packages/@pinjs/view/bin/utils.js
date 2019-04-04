const crossSpawn = require('cross-spawn');
const chokidar = require('chokidar');
const path = require('path');
const env = require('./env');

const startProcess = () => {
    let subCommandBinary = path.join(__dirname, 'cmds', env.currentCommand);
    const proc = crossSpawn('node', [
        ...env.nodeArguments,
        subCommandBinary,
        ...env.forwardedArgs
    ], { stdio: 'inherit' });
    proc.on('close', (code, signal) => {
        (code !== null) && process.exit(code);
        
        if (signal) {
            (signal === 'SIGKILL') && process.exit(137) && console.log(`got signal ${signal}, exiting`);
            process.exit(signal === 'SIGINT' || signal === 'SIGTERM' ? 0 : 1);
        }
        process.exit(0);
    });
    proc.on('error', err => console.error(err) && process.exit(1));

    return proc;
};

const killProcess = proc => {
    return () => proc && proc.kill();
};

const watchDev = proc => {
    let watchIgnored = [
        'package-lock.json',
        'node_modules',
        'package.json',
        'private',
        'public',
        'pages',
        'build',
        'bin',
    ].map(ignored => path.join(process.cwd(), ignored));
    const watcher = chokidar.watch(process.cwd(), {
        ignored: new RegExp(`^(${watchIgnored.join('|')})`),
        persistent: true
    });

    watcher.on('change', changedFile => {
        console.log(`\n> Found a change at ${changedFile.replace(process.cwd(), '')}, restarting the server...`);
        proc.removeAllListeners('close');
        proc.kill();
        proc = startProcess();
    });

}

exports.startProcess = startProcess;
exports.killProcess = killProcess;
exports.watchDev = watchDev;
