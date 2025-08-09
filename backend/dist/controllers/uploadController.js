"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const path_1 = __importDefault(require("path"));
class UploadController {
    // 단일 파일 업로드
    static async uploadSingle(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: 'No file uploaded',
                    message: '업로드할 파일을 선택해주세요.',
                });
            }
            const file = req.file;
            const fileUrl = `/uploads/${file.fieldname === 'document' ? 'documents' : 'images'}/${file.filename}`;
            res.json({
                success: true,
                message: '파일 업로드가 완료되었습니다.',
                data: {
                    filename: file.filename,
                    originalName: file.originalname,
                    url: fileUrl,
                    size: file.size,
                    mimeType: file.mimetype,
                },
            });
        }
        catch (error) {
            console.error('File upload error:', error);
            res.status(500).json({
                error: 'Upload failed',
                message: '파일 업로드 중 오류가 발생했습니다.',
            });
        }
    }
    // 다중 파일 업로드
    static async uploadMultiple(req, res) {
        try {
            const files = req.files;
            if (!files || Object.keys(files).length === 0) {
                return res.status(400).json({
                    error: 'No files uploaded',
                    message: '업로드할 파일을 선택해주세요.',
                });
            }
            const uploadedFiles = [];
            // 각 필드별로 파일 처리
            Object.keys(files).forEach(fieldname => {
                files[fieldname].forEach(file => {
                    const fileUrl = `/uploads/${fieldname === 'document' ? 'documents' : 'images'}/${file.filename}`;
                    uploadedFiles.push({
                        fieldname,
                        filename: file.filename,
                        originalName: file.originalname,
                        url: fileUrl,
                        size: file.size,
                        mimeType: file.mimetype,
                    });
                });
            });
            res.json({
                success: true,
                message: `${uploadedFiles.length}개 파일 업로드가 완료되었습니다.`,
                data: uploadedFiles,
            });
        }
        catch (error) {
            console.error('Multiple file upload error:', error);
            res.status(500).json({
                error: 'Upload failed',
                message: '파일 업로드 중 오류가 발생했습니다.',
            });
        }
    }
    // 파일 삭제 (관리자 전용)
    static async deleteFile(req, res) {
        try {
            const { filename, type } = req.params;
            if (!filename || !type) {
                return res.status(400).json({
                    error: 'Missing parameters',
                    message: '파일명과 타입을 지정해주세요.',
                });
            }
            const filePath = path_1.default.join(process.cwd(), 'uploads', type, filename);
            // 파일 존재 확인 및 삭제 로직은 deleteFile 유틸 함수 사용
            const { deleteFile } = await Promise.resolve().then(() => __importStar(require('../middleware/upload')));
            await deleteFile(`${type}/${filename}`);
            res.json({
                success: true,
                message: '파일이 삭제되었습니다.',
            });
        }
        catch (error) {
            console.error('File deletion error:', error);
            res.status(500).json({
                error: 'Deletion failed',
                message: '파일 삭제 중 오류가 발생했습니다.',
            });
        }
    }
}
exports.UploadController = UploadController;
//# sourceMappingURL=uploadController.js.map