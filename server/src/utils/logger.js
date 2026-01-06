const COLORS = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    red: '\x1b[31m',
}

export function logWithMeta(message, data) {
    const stack = new Error().stack.split('\n')[2]
    const match =
        stack.match(/\((.*):(\d+):(\d+)\)/) ||
        stack.match(/at (.*):(\d+):(\d+)/)

    const file = match?.[1]?.split(/[\\/]/).pop() ?? 'unknown'
    const line = match?.[2] ?? '0'

    console.log(
        `${COLORS.cyan}[${file}:${line}]${COLORS.reset} : ${message}`,
        data
    )
}
