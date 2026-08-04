import React from 'react';
import { useTranslation } from 'react-i18next';

function translateNode(node: React.ReactNode, language: string, entries: Array<[string, string]>): React.ReactNode {
  const shouldTranslate = language !== 'zh-CN';
  if (typeof node === 'string' && shouldTranslate) {
    return entries.reduce((value, [source, target]) => value.replaceAll(source, target), node);
  }
  if (Array.isArray(node)) return node.map((child, index) => <React.Fragment key={index}>{translateNode(child, language, entries)}</React.Fragment>);
  if (!React.isValidElement(node)) return node;
  const props = node.props as Record<string, unknown>;
  const nextProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if ((key === 'title' || key === 'placeholder' || key === 'alt' || key === 'aria-label') && typeof value === 'string' && shouldTranslate) {
      nextProps[key] = translateNode(value, language, entries);
    }
  }
  const children = props.children === undefined ? undefined : translateNode(props.children as React.ReactNode, language, entries);
  return children === undefined
    ? React.cloneElement(node, nextProps)
    : React.cloneElement(node, nextProps, children);
}

export default function LocalizedText({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  type Fallback = { terms?: Record<string, string>; phrases?: Record<string, string>; traditional?: Record<string, string> };
  type Resource = { components?: { fallback?: Fallback } };
  const resource = i18n.getResourceBundle(i18n.language, 'translation') as Resource | undefined;
  const englishResource = i18n.getResourceBundle('en-US', 'translation') as Resource | undefined;
  const fallbackBundle = resource?.components?.fallback ?? englishResource?.components?.fallback;
  const languageFallback = i18n.language === 'zh-TW'
    ? (resource?.components?.fallback?.traditional ?? {})
    : { ...(fallbackBundle?.terms ?? {}), ...(fallbackBundle?.phrases ?? {}) };
  const entries = Object.entries(languageFallback).sort((a, b) => b[0].length - a[0].length);
  return <>{translateNode(children, i18n.language, entries)}</>;
}
