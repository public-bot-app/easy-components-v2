class BuilderError {
    /**
     * Logs an error message safely without throwing a fatal exception.
     * @param {string} method The method where the error occurred
     * @param {string} reason Why the error occurred
     * @param {string} solution How to fix the error
     */
    static handle(method, reason, solution) {
        console.log('\n==================================================');
        console.log(`\x1b[31m❌ [EasyComponentsV2Builder Error]\x1b[0m in \x1b[36m${method}\x1b[0m`);
        console.log(`\x1b[33m❓ Reason:\x1b[0m ${reason}`);
        console.log(`\x1b[32m💡 Solution:\x1b[0m ${solution}`);
        console.log('==================================================\n');
    }
}

module.exports = BuilderError;
