// error handling middleware : Any error thrown anywhere in your application gets funneled directly into this function, 
// which structures the final JSON payload.

export const ErrorHandler=(err,req,res,next)=>{
    // 1. Set defaults for unexpected server crashes
    err.statusCode=err.statusCode || 500; 
    err.erroCode=err.erroCode || "Internal Server error"
    err.message=err.message || "Something went wrong"
    err.details=err.details || null

    //  response
    // If headers have already been sent by another middleware/handler, delegate to the default Express error handler
    if (res.headersSent) return next(err);

    return res.status(err.statusCode).json({
        Sucess:false,
        error:{
            Code:err.erroCode,
            message: err.isOperational ? err.message :"An unexpected error occured",
            details:err.details
        }
    })
}

