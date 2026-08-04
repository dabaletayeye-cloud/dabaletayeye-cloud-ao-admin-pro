import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { localizeText } from '../i18n/localizeText';

type TranslationRecord = {
  source: string;
  output: string;
};

const LOCALIZED_ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt'] as const;
const EXCLUDED_SELECTOR = 'script, style';

/**
 * Bridges legacy JSX strings that predate the i18next migration.
 *
 * New UI should still use `t()` directly. This component keeps existing demo
 * pages, mock data, modal text and runtime-created controls in the same JSON
 * translation pipeline while those pages are progressively refactored.
 */
export default function LegacyTextLocalizer() {
  const { i18n } = useTranslation();
  const textRecords = useRef(new WeakMap<Text, TranslationRecord>());
  const attributeRecords = useRef(new WeakMap<Element, Map<string, TranslationRecord>>());

  useEffect(() => {
    const language = i18n.resolvedLanguage ?? i18n.language;
    let scheduled = false;

    const getSource = (record: TranslationRecord | undefined, current: string) => {
      if (!record || current !== record.output) return current;
      return record.source;
    };

    const translateTextNode = (node: Text) => {
      const parent = node.parentElement;
      if (!parent || parent.closest(EXCLUDED_SELECTOR)) return;

      const current = node.data;
      const record = textRecords.current.get(node);
      const source = getSource(record, current);
      const output = localizeText(source, language);
      // Native options use their text as the value when no explicit value is
      // supplied. Keep the original source value so translated labels do not
      // break filtering logic in legacy controlled selects.
      if (parent.tagName === 'OPTION' && !parent.hasAttribute('value')) {
        parent.setAttribute('value', source);
      }
      textRecords.current.set(node, { source, output });
      if (current !== output) node.data = output;
    };

    const translateAttribute = (element: Element, attribute: string) => {
      if (element.closest(EXCLUDED_SELECTOR)) return;
      const current = element.getAttribute(attribute);
      if (!current) return;

      const records = attributeRecords.current.get(element) ?? new Map<string, TranslationRecord>();
      const source = getSource(records.get(attribute), current);
      const output = localizeText(source, language);
      records.set(attribute, { source, output });
      attributeRecords.current.set(element, records);
      if (current !== output) element.setAttribute(attribute, output);
    };

    const translateAll = () => {
      if (typeof document === 'undefined') return;

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        translateTextNode(node as Text);
        node = walker.nextNode();
      }

      for (const attribute of LOCALIZED_ATTRIBUTES) {
        document.querySelectorAll(`[${attribute}]`).forEach((element) => translateAttribute(element, attribute));
      }
    };

    const scheduleTranslation = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        translateAll();
      });
    };

    translateAll();
    const observer = new MutationObserver(scheduleTranslation);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...LOCALIZED_ATTRIBUTES],
    });

    return () => observer.disconnect();
  }, [i18n, i18n.language, i18n.resolvedLanguage]);

  return null;
}
