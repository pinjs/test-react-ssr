const chalk = require('chalk');

exports.info = (msg, extra = null) => {
    console.log(chalk.white(msg));
    extra && console.log(JSON.stringify(extra));
}

exports.error = (msg, extra = null) => {
    console.log(chalk.red(msg));
    extra && console.log(JSON.stringify(extra));
}
