import { createConsola } from "consola";
import chalk from "chalk";
const logConsola = createConsola();

type LogParams = [message?: any, ...params: any[]];
function log(...params: LogParams) {
    return logConsola.log(...params);
}

function success(...params: LogParams) {
    return logConsola.log(chalk.green(`✓`), ...params);
}
function warn(...params: LogParams) {
    return logConsola.warn(chalk.yellow(`▲`), ...params);
}
function error(...params: LogParams) {
    return logConsola.error(chalk.red(`✖︎`), ...params);
}

export const logger = {
    log,
    success,
    warn,
    error,
};
