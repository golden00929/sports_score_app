import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import path from 'path';

export class UploadController {
  // 단일 파일 업로드
  static async uploadSingle(req: AuthenticatedRequest, res: Response) {
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
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        error: 'Upload failed',
        message: '파일 업로드 중 오류가 발생했습니다.',
      });
    }
  }

  // 다중 파일 업로드
  static async uploadMultiple(req: AuthenticatedRequest, res: Response) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files || Object.keys(files).length === 0) {
        return res.status(400).json({
          error: 'No files uploaded',
          message: '업로드할 파일을 선택해주세요.',
        });
      }

      const uploadedFiles: any[] = [];

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
    } catch (error) {
      console.error('Multiple file upload error:', error);
      res.status(500).json({
        error: 'Upload failed',
        message: '파일 업로드 중 오류가 발생했습니다.',
      });
    }
  }

  // 파일 삭제 (관리자 전용)
  static async deleteFile(req: AuthenticatedRequest, res: Response) {
    try {
      const { filename, type } = req.params;
      
      if (!filename || !type) {
        return res.status(400).json({
          error: 'Missing parameters',
          message: '파일명과 타입을 지정해주세요.',
        });
      }

      const filePath = path.join(process.cwd(), 'uploads', type, filename);
      
      // 파일 존재 확인 및 삭제 로직은 deleteFile 유틸 함수 사용
      const { deleteFile } = await import('../middleware/upload');
      await deleteFile(`${type}/${filename}`);

      res.json({
        success: true,
        message: '파일이 삭제되었습니다.',
      });
    } catch (error) {
      console.error('File deletion error:', error);
      res.status(500).json({
        error: 'Deletion failed',
        message: '파일 삭제 중 오류가 발생했습니다.',
      });
    }
  }
}