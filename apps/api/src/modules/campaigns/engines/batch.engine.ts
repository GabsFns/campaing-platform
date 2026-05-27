import { Injectable } from '@nestjs/common';

@Injectable()
export class BatchEngine {
  createBatches<T>(items: T[], batchSize = 120): T[][] {
    const batches: T[][] = [];

    for (let index = 0; index < items.length; index += batchSize) {
      const batch = items.slice(index, index + batchSize);
      batches.push(batch);
    }
    return batches;
  }
}
