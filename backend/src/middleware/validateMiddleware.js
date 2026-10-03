import { ApiError } from "../utils/ApiError.js";

export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issue = result.error.issues[0];
      next(new ApiError(400, issue?.message || "Check the form and try again."));
      return;
    }
    req.body = result.data;
    next();
  };
}
