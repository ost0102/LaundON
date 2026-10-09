import { PrismaIotService } from './prismaIotService';

export * from './types';

// Swap this single line for a RealIotService implementation once actual
// hardware is connected - nothing else in the app references PrismaIotService
// directly.
export const iotService = new PrismaIotService();
