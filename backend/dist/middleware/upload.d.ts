import multer from 'multer';
declare const upload: multer.Multer;
export declare const resizeImage: (req: any, res: any, next: any) => Promise<any>;
export declare const deleteFile: (filePath: string) => Promise<void>;
export declare const uploadSingle: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadMultiple: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export default upload;
//# sourceMappingURL=upload.d.ts.map