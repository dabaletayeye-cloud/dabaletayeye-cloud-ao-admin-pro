import React from 'react';
import { useTranslation } from 'react-i18next';
import { localizeText } from '../i18n/localizeText';

const TEXT_PROPS = new Set([
  'title', 'placeholder', 'alt', 'aria-label', 'label', 'description', 'content',
  'message', 'text', 'helper', 'error', 'emptyText', 'name', 'region', 'department',
]);
const STRUCTURED_TEXT_PROPS = new Set(['options', 'items', 'data', 'columns', 'records']);
const PRESERVED_DATA_KEYS = new Set(['id', 'key', 'value', 'path', 'href', 'src', 'url', 'type', 'icon']);

function translateStructuredValue(value: unknown, language: string): unknown {
  if (typeof value === 'string') return language === 'zh-CN' ? value : localizeText(value, language);
  if (Array.isArray(value)) return value.map((item) => translateStructuredValue(item, language));
  if (!value || typeof value !== 'object' || React.isValidElement(value)) return value;

  const record = value as Record<string, unknown>;
  return Object.fromEntries(Object.entries(record).map(([key, item]) => [
    key,
    PRESERVED_DATA_KEYS.has(key) ? item : translateStructuredValue(item, language),
  ]));
}

function translateNode(node: React.ReactNode, language: string): React.ReactNode {
  const shouldTranslate = language !== 'zh-CN';
  if (typeof node === 'string' && shouldTranslate) {
    return localizeText(node, language);
  }
  if (Array.isArray(node)) return node.map((child, index) => <React.Fragment key={index}>{translateNode(child, language)}</React.Fragment>);
  if (!React.isValidElement(node)) return node;
  const props = node.props as Record<string, unknown>;
  const nextProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (TEXT_PROPS.has(key) && typeof value === 'string' && shouldTranslate) {
      nextProps[key] = translateNode(value, language);
    }
    if (STRUCTURED_TEXT_PROPS.has(key) && shouldTranslate) nextProps[key] = translateStructuredValue(value, language);
  }
  const children = props.children === undefined ? undefined : translateNode(props.children as React.ReactNode, language);
  return children === undefined
    ? React.cloneElement(node, nextProps)
    : React.cloneElement(node, nextProps, children);
}

export default function LocalizedText({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  return <>{translateNode(children, i18n.language)}</>;
}
