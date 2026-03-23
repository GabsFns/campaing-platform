import { SetMetadata } from '@nestjs/common';

export const Workspace = (...args: string[]) => SetMetadata('workspace', args);
