"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const notFound = (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `요청한 경로 ${req.originalUrl}을(를) 찾을 수 없습니다.`,
        path: req.originalUrl,
        method: req.method,
    });
};
exports.notFound = notFound;
//# sourceMappingURL=notFound.js.map