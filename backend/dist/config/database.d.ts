import { PrismaClient } from '@prisma/client';
declare const prisma: PrismaClient<{
    log: ("info" | "query" | "warn" | "error")[];
    errorFormat: "pretty";
}, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const getVietnamTime: (date?: Date) => Date;
export declare const formatVietnamTime: (date: Date, format?: "date" | "time" | "datetime") => string;
export { prisma };
export default prisma;
//# sourceMappingURL=database.d.ts.map