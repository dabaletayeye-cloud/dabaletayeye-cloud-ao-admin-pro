import i18n from './index';

type Fallback = {
  terms?: Record<string, string>;
  phrases?: Record<string, string>;
  traditional?: Record<string, string>;
};

type Resource = {
  components?: {
    fallback?: Fallback;
  };
};

function getEntries(language: string) {
  const resource = i18n.getResourceBundle(language, 'translation') as Resource | undefined;
  const englishResource = i18n.getResourceBundle('en-US', 'translation') as Resource | undefined;
  const fallback = resource?.components?.fallback ?? englishResource?.components?.fallback;
  const dictionary = language === 'zh-TW'
    ? resource?.components?.fallback?.traditional ?? {}
    : { ...(fallback?.terms ?? {}), ...(fallback?.phrases ?? {}) };

  return Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);
}

/** Applies the JSON fallback dictionary to text created outside a React tree. */
export function localizeText(value: string, language = i18n.resolvedLanguage ?? i18n.language): string {
  if (language === 'zh-CN') return value;
  return getEntries(language).reduce((current, [source, target]) => current.replaceAll(source, target), value);
}
