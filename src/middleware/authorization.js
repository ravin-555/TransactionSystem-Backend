// authorizes user or admin
import AppError from "../utils/AppError.js";
export const authorizeAdmin=async (req,res,next) => {
    const role = req.user.role
    console.log("role:"+role)
    if(role!=="admin"){
       throw new AppError(403, "Admin access required!", "AUTH_ADMIN_REQUIRED");
    }
    next();
}