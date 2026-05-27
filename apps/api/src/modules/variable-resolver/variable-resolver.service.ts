import { Injectable } from '@nestjs/common';
import { ResolveContext, ResolveOptions } from './type.js';

@Injectable()
export class VariableResolverService {
  resolve(
    template: string,
    context: ResolveContext,
    options: ResolveOptions = {},
  ): string {
    const regex = /{{(.*?)}}/g;

    return template.replace(regex, (_, rawKey: string) => {
      const key = rawKey.trim();

      // contact.name
      if (key.startsWith('contact.')) {
        const field = key.replace('contact.', '');
        return this.safeGet(context.contact, field, options.fallback);
      }

      // seller.name
      if (key.startsWith('seller.')) {
        const field = key.replace('seller.', '');
        return this.safeGet(context.seller, field, options.fallback);
      }

      // custom.discount
      if (key.startsWith('custom.')) {
        const field = key.replace('custom.', '');
        return this.safeGet(context.custom, field, options.fallback);
      }

      return options.fallback ?? '';
    });
  }

  private safeGet(
    obj: Record<string, any> | undefined,
    key: string,
    fallback = '',
  ): string {
    if (!obj) return fallback;

    const value = obj[key];

    if (value === undefined || value === null) {
      return fallback;
    }

    return String(value);
  }

  extractVariables(template: string): string[] {
    const regex = /{{(.*?)}}/g;

    const matches = [...template.matchAll(regex)];

    return matches.map((m) => m[1].trim());
  }
}
