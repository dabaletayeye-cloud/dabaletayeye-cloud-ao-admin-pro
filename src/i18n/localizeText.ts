import i18n from './index';

type Fallback = {
  terms?: Record<string, string>;
  phrases?: Record<string, string>;
  traditional?: Record<string, string>;
  supplemental?: Record<string, string>;
};

type Resource = {
  components?: {
    fallback?: Fallback;
  };
  templates?: {
    fallback?: Fallback;
  };
  content?: {
    fallback?: Fallback;
  };
  feedback?: {
    fallback?: Fallback;
  };
  analyticsPages?: {
    fallback?: Fallback;
  };
  media?: {
    fallback?: Fallback;
  };
  marketing?: {
    fallback?: Fallback;
  };
  pageExtras?: {
    fallback?: Fallback;
  };
  business?: {
    fallback?: Fallback;
  };
  systemPages?: {
    fallback?: Fallback;
  };
  lowcode?: {
    fallback?: Fallback;
  };
  ai?: {
    fallback?: Fallback;
  };
};

function getEntries(language: string) {
  const resource = i18n.getResourceBundle(language, 'translation') as Resource | undefined;
  const englishResource = i18n.getResourceBundle('en-US', 'translation') as Resource | undefined;
  const componentFallback = resource?.components?.fallback ?? englishResource?.components?.fallback;
  const templateFallback = resource?.templates?.fallback ?? englishResource?.templates?.fallback;
  const contentFallback = resource?.content?.fallback ?? englishResource?.content?.fallback;
  const feedbackFallback = resource?.feedback?.fallback ?? englishResource?.feedback?.fallback;
  const analyticsPagesFallback = resource?.analyticsPages?.fallback ?? englishResource?.analyticsPages?.fallback;
  const mediaFallback = resource?.media?.fallback ?? englishResource?.media?.fallback;
  const marketingFallback = resource?.marketing?.fallback ?? englishResource?.marketing?.fallback;
  const pageExtrasFallback = resource?.pageExtras?.fallback ?? englishResource?.pageExtras?.fallback;
  const businessFallback = resource?.business?.fallback ?? englishResource?.business?.fallback;
  const systemPagesFallback = resource?.systemPages?.fallback ?? englishResource?.systemPages?.fallback;
  const lowcodeFallback = resource?.lowcode?.fallback ?? englishResource?.lowcode?.fallback;
  const aiFallback = resource?.ai?.fallback ?? englishResource?.ai?.fallback;
  const dictionary = language === 'zh-TW'
    ? {
        ...(componentFallback?.traditional ?? {}),
        ...(componentFallback?.supplemental ?? {}),
        ...(templateFallback?.traditional ?? {}),
        ...(templateFallback?.terms ?? {}),
        ...(templateFallback?.phrases ?? {}),
        ...(templateFallback?.supplemental ?? {}),
        ...(contentFallback?.traditional ?? {}),
        ...(contentFallback?.terms ?? {}),
        ...(contentFallback?.phrases ?? {}),
        ...(contentFallback?.supplemental ?? {}),
        ...(feedbackFallback?.traditional ?? {}),
        ...(feedbackFallback?.terms ?? {}),
        ...(feedbackFallback?.phrases ?? {}),
        ...(feedbackFallback?.supplemental ?? {}),
        ...(analyticsPagesFallback?.traditional ?? {}),
        ...(analyticsPagesFallback?.terms ?? {}),
        ...(analyticsPagesFallback?.phrases ?? {}),
        ...(analyticsPagesFallback?.supplemental ?? {}),
        ...(mediaFallback?.traditional ?? {}),
        ...(mediaFallback?.terms ?? {}),
        ...(mediaFallback?.phrases ?? {}),
        ...(mediaFallback?.supplemental ?? {}),
        ...(marketingFallback?.traditional ?? {}),
        ...(marketingFallback?.terms ?? {}),
        ...(marketingFallback?.phrases ?? {}),
        ...(marketingFallback?.supplemental ?? {}),
        ...(pageExtrasFallback?.traditional ?? {}),
        ...(pageExtrasFallback?.terms ?? {}),
        ...(pageExtrasFallback?.phrases ?? {}),
        ...(pageExtrasFallback?.supplemental ?? {}),
        ...(businessFallback?.traditional ?? {}),
        ...(businessFallback?.terms ?? {}),
        ...(businessFallback?.phrases ?? {}),
        ...(businessFallback?.supplemental ?? {}),
        ...(systemPagesFallback?.traditional ?? {}),
        ...(systemPagesFallback?.terms ?? {}),
        ...(systemPagesFallback?.phrases ?? {}),
        ...(systemPagesFallback?.supplemental ?? {}),
        ...(lowcodeFallback?.traditional ?? {}),
        ...(lowcodeFallback?.terms ?? {}),
        ...(lowcodeFallback?.phrases ?? {}),
        ...(lowcodeFallback?.supplemental ?? {}),
        ...(aiFallback?.traditional ?? {}),
        ...(aiFallback?.terms ?? {}),
        ...(aiFallback?.phrases ?? {}),
        ...(aiFallback?.supplemental ?? {}),
      }
    : {
        ...(componentFallback?.terms ?? {}),
        ...(componentFallback?.phrases ?? {}),
        ...(componentFallback?.supplemental ?? {}),
        ...(templateFallback?.terms ?? {}),
        ...(templateFallback?.phrases ?? {}),
        ...(templateFallback?.supplemental ?? {}),
        ...(contentFallback?.terms ?? {}),
        ...(contentFallback?.phrases ?? {}),
        ...(contentFallback?.supplemental ?? {}),
        ...(feedbackFallback?.terms ?? {}),
        ...(feedbackFallback?.phrases ?? {}),
        ...(feedbackFallback?.supplemental ?? {}),
        ...(analyticsPagesFallback?.terms ?? {}),
        ...(analyticsPagesFallback?.phrases ?? {}),
        ...(analyticsPagesFallback?.supplemental ?? {}),
        ...(mediaFallback?.terms ?? {}),
        ...(mediaFallback?.phrases ?? {}),
        ...(mediaFallback?.supplemental ?? {}),
        ...(marketingFallback?.terms ?? {}),
        ...(marketingFallback?.phrases ?? {}),
        ...(marketingFallback?.supplemental ?? {}),
        ...(pageExtrasFallback?.terms ?? {}),
        ...(pageExtrasFallback?.phrases ?? {}),
        ...(pageExtrasFallback?.supplemental ?? {}),
        ...(businessFallback?.terms ?? {}),
        ...(businessFallback?.phrases ?? {}),
        ...(businessFallback?.supplemental ?? {}),
        ...(systemPagesFallback?.terms ?? {}),
        ...(systemPagesFallback?.phrases ?? {}),
        ...(systemPagesFallback?.supplemental ?? {}),
        ...(lowcodeFallback?.terms ?? {}),
        ...(lowcodeFallback?.phrases ?? {}),
        ...(lowcodeFallback?.supplemental ?? {}),
        ...(aiFallback?.terms ?? {}),
        ...(aiFallback?.phrases ?? {}),
        ...(aiFallback?.supplemental ?? {}),
      };

  return Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);
}

/** Applies the JSON fallback dictionary to text created outside a React tree. */
export function localizeText(value: string, language = i18n.resolvedLanguage ?? i18n.language): string {
  if (language === 'zh-CN') return value;
  return getEntries(language).reduce((current, [source, target]) => current.replaceAll(source, target), value);
}
