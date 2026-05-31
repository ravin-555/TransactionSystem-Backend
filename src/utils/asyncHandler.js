// Wraps your controllers async route and auto-forwards any failures to the global error handler but not middlewares
export const catchAsync = (fn) => {
    return (req, res, next) => {
        try {
            const maybePromise = fn(req, res, next);
            // If the handler returned a promise, attach a catch
            if (maybePromise && typeof maybePromise.catch === 'function') {
                maybePromise.catch(next);
            }
            // If it's synchronous, any thrown error is handled by the try/catch above
        } catch (err) {
            next(err);
        }
    }
};