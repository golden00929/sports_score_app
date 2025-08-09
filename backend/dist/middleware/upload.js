"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.uploadSingle = exports.deleteFile = exports.resizeImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
const promises_1 = __importDefault(require("fs/promises"));
// 파일 저장 설정
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = file.fieldname === 'document'
            ? path_1.default.join(process.cwd(), 'uploads/documents')
            : path_1.default.join(process.cwd(), 'uploads/images');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}-${Date.now()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
// 파일 필터 함수
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'image' || file.fieldname === 'poster') {
        // 이미지 파일 검증
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'));
        }
    }
    else if (file.fieldname === 'document') {
        // 문서 파일 검증 (PDF, DOC, DOCX)
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('PDF, DOC, DOCX 파일만 업로드 가능합니다.'));
        }
    }
    else {
        cb(new Error('허용되지 않은 필드입니다.'));
    }
};
// Multer 설정
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5, // 최대 5개 파일
    },
});
// 이미지 리사이징 미들웨어
const resizeImage = async (req, res, next) => {
    try {
        if (!req.files && !req.file)
            return next();
        const files = req.files || [req.file];
        const processedFiles = [];
        for (const file of files) {
            if (file && file.mimetype.startsWith('image/')) {
                const originalPath = file.path;
                const resizedPath = originalPath.replace(path_1.default.extname(originalPath), '_resized.jpg');
                // 이미지 리사이징 (최대 1200x800, 품질 80%)
                await (0, sharp_1.default)(originalPath)
                    .resize(1200, 800, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                    .jpeg({ quality: 80 })
                    .toFile(resizedPath);
                // 원본 파일 삭제
                await promises_1.default.unlink(originalPath);
                // 파일 정보 업데이트
                file.path = resizedPath;
                file.filename = path_1.default.basename(resizedPath);
                processedFiles.push(file);
            }
            else {
                processedFiles.push(file);
            }
        }
        if (req.files) {
            req.files = processedFiles;
        }
        else {
            req.file = processedFiles[0];
        }
        next();
    }
    catch (error) {
        console.error('Image resize error:', error);
        next(error);
    }
};
exports.resizeImage = resizeImage;
// 파일 삭제 유틸리티
const deleteFile = async (filePath) => {
    try {
        const fullPath = path_1.default.join(process.cwd(), 'uploads', filePath);
        await promises_1.default.unlink(fullPath);
    }
    catch (error) {
        console.error('File deletion error:', error);
    }
};
exports.deleteFile = deleteFile;
// 업로드 미들웨어 export
exports.uploadSingle = upload.single('image');
exports.uploadMultiple = upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'document', maxCount: 3 },
    { name: 'sponsors', maxCount: 10 },
]);
exports.default = upload;
//# sourceMappingURL=upload.js.map