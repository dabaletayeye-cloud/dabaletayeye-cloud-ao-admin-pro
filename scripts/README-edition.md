# 按版本裁剪与回退

页面里的版本切换只隐藏入口。本脚本会备份并物理移除不需要的 `src/modules/<模块>` 目录，随后重新生成路由、菜单、权限注册表，并自动将本地前端设为目标版本。

## 裁剪成 SaaS 版

在前端项目根目录执行：

```powershell
# 先看保留和移除清单，不修改任何文件
npm run clean:edition -- --edition=saas --dry-run

# 正式执行：自动备份后裁剪
npm run clean:edition -- --edition=saas --yes

# 如果有未提交代码，也可以明确使用当前文件快照备份
npm run clean:edition -- --edition=saas --yes --allow-dirty
```

不传 `--edition` 会提供版本选择。可选：`minimal`、`erp`、`oa`、`saas`、`ecommerce`、`devplatform`、`bi`、`demo`、`ai`、`cms`、`crm`、`full`。

预设定义在 `scripts/edition-presets.json`，与后端 `EditionPresets` 的默认候选清单对应；修改产品版本映射时应同时更新这两处。只保留实际存在的模块，自动补齐模块清单声明的依赖。未知版本、缺失依赖或目标版本无可用模块会报错，不会降级成“全部删除”。

SaaS 默认保留 `ai`、`analytics`、`content`、`marketing`、`media`、`operations`。`devplatform` 的服务器入口目前属于 `operations`，物理裁剪保留完整宿主模块，运行时选择开发者平台版后仍只显示服务器入口。

## 回退

```powershell
# 查看每次裁剪的备份 ID、版本和状态
npm run edition:backups

# 预览最近一次回退
npm run restore:edition -- --dry-run

# 回退最近一次裁剪
npm run restore:edition -- --yes

# 指定备份（仍必须按时间从新到旧依次回退）
npm run restore:edition -- --backup=备份ID --yes
```

备份在项目根目录 `.edition-backups/`，不依赖 Git 历史，包含裁剪时的未提交文件和 SHA-256 校验。多次裁剪后，多次运行回退命令可逐步返回最初状态。`--edition=full` 只保留当前已存在的模块，不能代替回退。

恢复补回当次移除的目录，同时恢复上一次本地版本；此前没有本地版本时回到全部版。保留模块的后续开发不会被覆盖。如果同名目录已经重新创建，脚本停止并提示冲突，请先移走冲突目录；不会提供强制覆盖选项。恢复后备份仍保留。

目标版本记录在 `src/config/build-edition.json`，构建时生成 `src/generated/buildEdition.ts`，随前端产物生效，不需要脚本登录后端。服务器返回的旧版本不会覆盖这次裁剪结果。管理员之后在页面主动保存其他版本，当前浏览器会记住该选择；下一次裁剪或回退会重新应用新的目标版本。

旧脚本留下的未回退裁剪备份，也会在下一次 `npm run dev` / `npm run build` 时自动迁移为本地目标版本，无需再次删除模块。

若生成注册表失败，已校验的备份会保留，可使用同一个恢复命令处理。恢复时生成失败可再次运行以继续。进程被强制终止后若残留 `.edition-backups/lock`，先确认没有其他裁剪任务运行，再移除该空锁目录；删除中的目录部分残留时，先移走残留目录再恢复。

## 边界与验证

- 不修改后端代码、数据库、业务数据、角色权限或服务器上的版本配置。
- 不删除 `src/pages` 中共享/历史页面源码、公共组件或 npm 依赖，以避免破坏跨模块引用；已裁剪模块不会进入生成的注册表。若需要进一步清理历史演示源码，原来的 `clean:demo` / `restore:demo` 是独立流程，不要将其恢复命令与此备份混用。
- 裁剪/恢复后重启前端开发服务，版本自动生效，无需在页面手动选择。后端沿用原有模块清单目录发现配置。
- `.edition-backups` 也需要随项目迁移或另行备份；丢失该目录后本脚本无法回退。

```powershell
node scripts/test-edition-prune.mjs
# 在临时副本执行 SaaS 裁剪、真实构建和恢复，不裁剪当前源码
node scripts/test-edition-prune.mjs --build
```
