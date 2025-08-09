import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import fs from 'fs/promises';

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === 'document' 
      ? path.join(process.cwd(), 'uploads/documents')
      : path.join(process.cwd(), 'uploads/images');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// 파일 필터 함수
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'image' || file.fieldname === 'poster') {
    // 이미지 파일 검증
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  } else if (file.fieldname === 'document') {
    // 문서 파일 검증 (PDF, DOC, DOCX)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('PDF, DOC, DOCX 파일만 업로드 가능합니다.'));
    }
  } else {
    cb(new Error('허용되지 않은 필드입니다.'));
  }
};

// Multer 설정
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5, // 최대 5개 파일
  },
});

// 이미지 리사이징 미들웨어
export const resizeImage = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    if (!req.files && !req.file) return next();

    const files = req.files || [req.file];
    const processedFiles: Express.Multer.File[] = [];

    for (const file of files) {
      if (file && file.mimetype.startsWith('image/')) {
        const originalPath = file.path;
        const resizedPath = originalPath.replace(path.extname(originalPath), '_resized.jpg');

        // 이미지 리사이징 (최대 1200x800, 품질 80%)
        await sharp(originalPath)
          .resize(1200, 800, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toFile(resizedPath);

        // 원본 파일 삭제
        await fs.unlink(originalPath);

        // 파일 정보 업데이트
        file.path = resizedPath;
        file.filename = path.basename(resizedPath);
        
        processedFiles.push(file);
      } else {
        processedFiles.push(file);
      }
    }

    if (req.files) {
      req.files = processedFiles;
    } else {
      req.file = processedFiles[0];
    }

    next();
  } catch (error) {
    console.error('Image resize error:', error);
    next(error);
  }
};

// 파일 삭제 유틸리티
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.join(process.cwd(), 'uploads', filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('File deletion error:', error);
  }
};

// 업로드 미들웨어 export
export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'document', maxCount: 3 },
  { name: 'sponsors', maxCount: 10 },
]);

export default upload;