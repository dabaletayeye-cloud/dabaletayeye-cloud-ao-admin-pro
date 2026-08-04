import { toast as sonnerToast } from 'sonner';
import { localizeText } from '../i18n/localizeText';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function localizeOptions(options: unknown) {
  if (!isPlainObject(options)) return options;
  const translated = { ...options };
  if (typeof translated.description === 'string') translated.description = localizeText(translated.description);

  for (const key of ['action', 'cancel'] as const) {
    const option = translated[key];
    if (isPlainObject(option) && typeof option.label === 'string') {
      translated[key] = { ...option, label: localizeText(option.label) };
    }
  }

  return translated;
}

function localizeArgs(args: unknown[]) {
  const [message, options, ...rest] = args;
  return [typeof message === 'string' ? localizeText(message) : message, localizeOptions(options), ...rest];
}

/** Keeps Sonner's API intact while localizing runtime notification text. */
export const toast = new Proxy(sonnerToast, {
  apply(target, thisArg, args) {
    return Reflect.apply(target, thisArg, localizeArgs(args));
  },
  get(target, property, receiver) {
    const member = Reflect.get(target, property, receiver);
    if (typeof member !== 'function') return member;
    return (...args: unknown[]) => Reflect.apply(member, target, localizeArgs(args));
  },
}) as typeof sonnerToast;
