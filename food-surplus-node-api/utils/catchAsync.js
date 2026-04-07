/**
 * Async Wrapper Function
 * Eliminates the need for try/catch blocks in express controllers
 * Any error thrown inside the async fn is automatically caught and passed to the next() error handler
 */
module.exports = fn => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
