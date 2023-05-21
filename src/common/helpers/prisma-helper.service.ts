import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaHelper {
  generateSelectFields<T>(clazz: { new (): T }) {
    const target = new clazz();
    const keys = Object.keys(target);
    const selectFields = {};

    for (const key of keys) {
      selectFields[key] = true;
    }

    return selectFields;
  }
}
