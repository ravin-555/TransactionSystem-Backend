// custom error class that extends the built-in Error object to centralize error handling,
class AppError extends Error{
    constructor(statusCode,message,errorCode, details=null){
        super(message)
        this.statusCode=statusCode
        this.errorCode = errorCode // AUTH_EXPIRED_TOKEN', 'VALIDATION_FAILED'
        this.details = details /// Object containing field-specific info
        this.isOperational = true;  // Flags this as a known/trusted runtime error
        
        Error.captureStackTrace(this,this.constructor);
    }
}
export default AppError; 