const arg = require('arg');

const supportedCommands = [
    'dev',
    'build',
    'start',
];

const args = arg({
    '--help': Boolean,
    '--version': Boolean,
    '-h': '--help',
}, {
    permissive: true,
});

const currentCommand = supportedCommands.includes(args._[0]) ? args._[0] : '';
const forwardedArgs = currentCommand ? args._.slice(1) : args._;
args['--help'] && forwardedArgs.push('--help'); // Forward --help to sub command
const nodeArguments = [];
args['--inspect'] && nodeArguments.push('--inspect');

const defaultEnv = currentCommand === 'dev' ? 'development' : 'production';
process.env.NODE_ENV = process.env.NODE_ENV || defaultEnv;

exports.args = args;
exports.supportedCommands = supportedCommands;
exports.currentCommand = currentCommand;
exports.nodeArguments = nodeArguments;
exports.forwardedArgs = forwardedArgs;
