"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
function validateBody(schema) {
    return (req, res, next) => {
        const parsed = schema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Payload inválido",
                errors: parsed.error.format(),
            });
        }
        req.body = parsed.data;
        next();
    };
}
//# sourceMappingURL=validate.js.map