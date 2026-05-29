const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

class Logger {
    static formatTimestamp() {
        return new Date().toISOString();
    }

    static info(message, data = {}) {
        console.log(
            `${colors.cyan}[INFO]${colors.reset} ${colors.bright}${this.formatTimestamp()}${colors.reset} - ${message}`,
            Object.keys(data).length > 0 ? data : ''
        );
    }

    static success(message, data = {}) {
        console.log(
            `${colors.green}[SUCCESS]${colors.reset} ${colors.bright}${this.formatTimestamp()}${colors.reset} - ${message}`,
            Object.keys(data).length > 0 ? data : ''
        );
    }

    static warn(message, data = {}) {
        console.warn(
            `${colors.yellow}[WARN]${colors.reset} ${colors.bright}${this.formatTimestamp()}${colors.reset} - ${message}`,
            Object.keys(data).length > 0 ? data : ''
        );
    }

    static error(message, error = null, data = {}) {
        console.error(
            `${colors.red}[ERROR]${colors.reset} ${colors.bright}${this.formatTimestamp()}${colors.reset} - ${message}`
        );

        if (error) {
            console.error(`${colors.red}Error Message:${colors.reset}`, error.message);
            if (error.stack) {
                console.error(`${colors.red}Stack Trace:${colors.reset}\n`, error.stack);
            }
        }

        if (Object.keys(data).length > 0) {
            console.error(`${colors.red}Additional Data:${colors.reset}`, data);
        }
    }

    static debug(message, data = {}) {
        if (process.env.NODE_ENV === 'development') {
            console.log(
                `${colors.magenta}[DEBUG]${colors.reset} ${colors.bright}${this.formatTimestamp()}${colors.reset} - ${message}`,
                Object.keys(data).length > 0 ? data : ''
            );
        }
    }

    static request(req) {
        console.log(
            `${colors.blue}[REQUEST]${colors.reset} ${colors.bright}${this.formatTimestamp()}${colors.reset} - ${req.method} ${req.path}`,
            {
                params: req.params,
                query: req.query,
                userId: req.user?.id,
                userRole: req.user?.role
            }
        );
    }
}

module.exports = Logger;
