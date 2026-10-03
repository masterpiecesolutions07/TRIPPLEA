import { ApiError } from "../utils/ApiError.js";

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new ApiError(403, "You do not have access to that area."));
      return;
    }
    next();
  };
}
