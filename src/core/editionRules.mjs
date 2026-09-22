export const EDITIONS = ['minimal', 'erp', 'oa', 'saas', 'ecommerce', 'devplatform', 'bi', 'demo', 'ai', 'cms', 'crm', 'full'];
const idPattern = /^[a-z][a-z0-9_-]{0,63}$/;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function checkKeys(value, allowed, label) {
  if (!object(value)) throw new Error(`${label} 必须是对象`);
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`${label} 未知字段：${key}`);
}
function ids(value, label) {
  if (!Array.isArray(value) || value.some(id => typeof id !== 'string' || !idPattern.test(id))) throw new Error(`${label} 必须是合法模块 ID 数组`);
}
export function validateEditionRules(value) {
  checkKeys(value, ['version', 'enabled', 'preserveCustomModules', 'builtInModules', 'editions'], '版本规则');
  if (value.version !== 1) throw new Error('版本规则 version 必须为 1');
  for (const key of ['enabled', 'preserveCustomModules']) if (typeof value[key] !== 'boolean') throw new Error(`${key} 必须是布尔值`);
  ids(value.builtInModules, 'builtInModules');
  if (!object(value.editions)) throw new Error('editions 必须是对象');
  for (const [edition, rule] of Object.entries(value.editions)) {
    if (!EDITIONS.includes(edition)) throw new Error(`未知版本：${edition}`);
    checkKeys(rule, ['preserveCustomModules', 'include', 'exclude'], edition);
    if ('preserveCustomModules' in rule && typeof rule.preserveCustomModules !== 'boolean') throw new Error(`${edition}.preserveCustomModules 必须是布尔值`);
    for (const key of ['include', 'exclude']) if (key in rule) ids(rule[key], `${edition}.${key}`);
    if (rule.exclude?.includes('core')) throw new Error('核心模块 core 不能排除');
  }
  return value;
}
export function isCustomModule(module, rules) { return module !== 'core' && !rules.builtInModules.includes(module); }
export function isExplicitlyExcluded(module, edition, rules) { return rules.enabled && !!rules.editions[edition]?.exclude?.includes(module); }
export function moduleMatchesRules(module, edition, baseEnabled, rules) {
  if (!module || module === 'core') return true;
  if (!rules.enabled) return baseEnabled;
  const rule = rules.editions[edition] ?? {};
  if (rule.exclude?.includes(module)) return false;
  if (rule.include?.includes(module)) return true;
  return baseEnabled || ((rule.preserveCustomModules ?? rules.preserveCustomModules) && isCustomModule(module, rules));
}
export function resolveEditionModules(edition, presetModules, installed, rules) {
  validateEditionRules(rules);
  return [...new Set([...(presetModules === '*' ? installed : presetModules), ...installed])].filter(id => installed.includes(id) && moduleMatchesRules(id, edition, presetModules === '*' || presetModules.includes(id), rules));
}
