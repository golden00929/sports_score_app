import { Request, Response } from 'express';
export declare class LocationController {
    static getProvinces(req: Request, res: Response): Promise<void>;
    static getDistricts(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static searchLocations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getLocationDetail(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=locationController.d.ts.map