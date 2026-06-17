/**
 * Clase de utilidad para manejar los logs de la consola de forma estética y organizada.
 */
export class Logger {
    private static getTime(): string {
        return new Date().toLocaleTimeString("es-ES", { hour12: false });
    }

    static info(message: string): void {
        console.log(`[\x1b[34m${this.getTime()}\x1b[0m] [\x1b[34mINFO\x1b[0m] ${message}`);
    }

    static success(message: string): void {
        console.log(`[\x1b[32m${this.getTime()}\x1b[0m] [\x1b[32mSUCCESS\x1b[0m] ${message}`);
    }

    static warn(message: string): void {
        console.warn(`[\x1b[33m${this.getTime()}\x1b[0m] [\x1b[33mWARN\x1b[0m] ${message}`);
    }

    static error(message: string, error?: unknown): void {
        console.error(`[\x1b[31m${this.getTime()}\x1b[0m] [\x1b[31mERROR\x1b[0m] ${message}`, error || "");
    }

    static debug(message: string): void {
        if (process.env.NODE_ENV === "development") {
            console.log(`[\x1b[35m${this.getTime()}\x1b[0m] [\x1b[35mDEBUG\x1b[0m] ${message}`);
        }
    }
}
