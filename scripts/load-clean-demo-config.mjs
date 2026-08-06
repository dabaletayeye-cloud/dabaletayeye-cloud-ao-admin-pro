import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(scriptDir, 'clean-demo.config.json');

function requireString(value, description) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`配置项无效：${description} 必须是非空字符串。`);
  }
}

function requireStringArray(value, description) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.length === 0)) {
    throw new Error(`配置项无效：${description} 必须是字符串数组。`);
  }
}

export async function loadCleanDemoConfig() {
  let config;
  try {
    config = JSON.parse(await readFile(configPath, 'utf8'));
  } catch (error) {
    throw new Error(`无法读取清理配置 ${path.basename(configPath)}：${error.message}`);
  }

  if (!config || typeof config !== 'object' || !config.core || !Array.isArray(config.modules)) {
    throw new Error('清理配置必须包含 core 对象和 modules 数组。');
  }
  requireString(config.core.name, 'core.name');
  requireStringArray(config.core.keepModuleIds, 'core.keepModuleIds');
  requireStringArray(config.core.restoreModuleIds, 'core.restoreModuleIds');
  if (!Array.isArray(config.core.retained) || config.core.retained.some((item) => !item || typeof item.label !== 'string')) {
    throw new Error('配置项无效：core.retained 必须是带 label 的数组。');
  }

  const ids = new Set();
  for (const module of config.modules) {
    if (!module || typeof module !== 'object') throw new Error('配置项无效：modules 只能包含对象。');
    requireString(module.id, 'modules[].id');
    requireString(module.label, `modules.${module.id}.label`);
    requireString(module.description, `modules.${module.id}.description`);
    requireStringArray(module.targets, `modules.${module.id}.targets`);
    if (ids.has(module.id)) throw new Error(`配置项无效：模块 ID 重复：${module.id}。`);
    ids.add(module.id);

    if (!Array.isArray(module.blocks)) throw new Error(`配置项无效：modules.${module.id}.blocks 必须是数组。`);
    for (const block of module.blocks) {
      if (!block || typeof block !== 'object') throw new Error(`配置项无效：modules.${module.id}.blocks 只能包含对象。`);
      requireString(block.file, `modules.${module.id}.blocks[].file`);
      requireString(block.start, `modules.${module.id}.blocks[].start`);
      requireString(block.end, `modules.${module.id}.blocks[].end`);
      if (block.restoreAnchors !== undefined) requireStringArray(block.restoreAnchors, `modules.${module.id}.blocks[].restoreAnchors`);
      if (block.restoreOrder !== undefined && !Number.isFinite(block.restoreOrder)) {
        throw new Error(`配置项无效：modules.${module.id}.blocks[].restoreOrder 必须是数字。`);
      }
    }
  }

  const referencedIds = [...config.core.keepModuleIds, ...config.core.restoreModuleIds];
  const unknownIds = referencedIds.filter((id) => !ids.has(id));
  if (unknownIds.length > 0) throw new Error(`配置项无效：核心版引用了未知模块：${unknownIds.join('、')}。`);

  if (config.dependencies !== undefined && !Array.isArray(config.dependencies)) {
    throw new Error('配置项无效：dependencies 必须是数组。');
  }
  return { ...config, dependencies: config.dependencies ?? [] };
}
