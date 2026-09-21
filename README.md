# ao-admin-pro

面向中后台场景的 React + TypeScript 前端项目，包含业务页面、组件模板、主题配置和模块化版本预设。支持 **纯前端 Mock 演示**，也支持连接配套 Spring Boot 后端。

## 环境与技术栈

- Node.js：**20.19+（20.x）或 22.12+**，与当前 Vite 依赖要求一致。
- 包管理器：npm。
- React 19、TypeScript 5.9、Vite 7、React Router 7、Tailwind CSS 4。
- Radix UI、Lucide React、ECharts、Recharts、React Hook Form、Zod、Sonner、XLSX。
- i18next / react-i18next：简体中文、繁体中文、英语、日语、韩语、法语、德语。

## 快速开始：纯前端演示

在项目根目录执行，无需启动 Java 后端或数据库：

```powershell
npm install
npm run dev:mock
```

打开终端显示的地址，默认是 [http://localhost:5174](http://localhost:5174)。开发和预览服务均优先使用 5174，端口被占用时会尝试其他端口。切换运行模式前，先用 `Ctrl+C` 停止旧的前端服务。

### 登录账号配置

演示账号在 [src/config/mock-auth.json](src/config/mock-auth.json) 中配置：

```json
{
  "username": "demo",
  "password": "demo123"
}
```

登录页会带出配置的账号，输入密码、拖动滑块完成验证后登录。Mock 模式会校验这两项，不再接受任意账号密码。

修改配置后刷新开发页面；已部署的静态站需要重新构建部署。这是会随前端产物公开的演示配置，不能放真实账号密码。HTTP 模式的账号由后端认证，此文件不会修改后端用户。

### 演示数据范围

- ERP：商品、订单、采购、供应商、库存、客户、财务和报表；支持增删改、CSV 导入、出入库、库存不足校验及采购审批等模拟操作。
- OA：审批、考勤、公告、日程、组织架构；支持记录维护、审批状态变化和重复打卡校验。
- 媒体库：提供演示图片和文本，支持在浏览器内上传、预览和下载文件。
- 工作台、用户、角色、系统设置、服务器和低代码等沿用各自的 Mock 接口或页面演示数据。
- AI 中心提供前端交互演示，不代表已接入真实大模型服务。

ERP/OA Mock 业务记录与上传文件保存在当前页面会话内，整页刷新后恢复初始数据。主题、语言与 Mock 版本选择等偏好保存到浏览器中；其他页面按各自的存储方式处理。

详细说明：[纯前端演示](docs/纯前端演示.md)。

## 连接真实后端

修改项目根目录 `.env`：

```env
VITE_API_MODE=http
VITE_API_BASE_URL=http://localhost:8989
VITE_DEFAULT_LOGIN_ACCOUNT=
```

启动配套 Spring Boot 后端后执行：

```powershell
npm run dev
```

- `npm run dev` 使用常规环境配置；未配置数据源模式时，代码默认使用 Mock。
- `npm run dev:mock` 使用 [.env.mock](.env.mock)，无需覆盖原有的 HTTP 联调配置。
- `VITE_DEFAULT_LOGIN_ACCOUNT` 只用于 HTTP 登录表单预填账号，不是认证配置。
- 修改环境变量后需要重启前端；从 Mock 切到 HTTP 时应重新登录真实账号。
- 不同业务的后端接入程度以对应 API 适配器为准，前端演示交互不等于真实服务实现。

接口约定及鉴权说明见 [前后端数据层对接说明](docs/前后端数据层对接说明.md)。

## 功能与页面入口

| 分类 | 功能 | 常用路径 |
| --- | --- | --- |
| 工作台与分析 | 工作台、分析看板、访问统计、用户画像、转化漏斗 | `/`、`/dashboard/analytics`、`/analytics/traffic`、`/analytics/portrait`、`/analytics/funnel` |
| ERP | 商品、订单、采购、库存、客户、财务、报表 | `/erp/products`、`/erp/orders`、`/erp/purchase`、`/erp/inventory`、`/erp/customers`、`/erp/finance`、`/erp/reports` |
| OA | 审批、考勤、公告、日程、组织架构 | `/oa/approval`、`/oa/attendance`、`/oa/notices`、`/oa/schedule`、`/oa/org` |
| AI 中心 | 对话、助手、客服、知识库、提示词、模型、工作流 | `/ai/chat`、`/ai/agent`、`/ai/knowledge`、`/ai/workflow` |
| 内容与营销 | 文章、分类、标签、媒体、优惠券、活动、推送 | `/content/articles`、`/article/list`、`/media`、`/marketing/coupons` |
| 低代码 | 接口编排、页面设计、表单、报表、数据源、发布 | `/lowcode/api`、`/lowcode/page`、`/lowcode/report`、`/lowcode/release` |
| 系统与账号 | 用户、角色、菜单、日志、字典、配置、个人资料 | `/system/users`、`/system/roles`、`/system/config`、`/profile`、`/account-security` |
| 示例与模板 | 组件、表格、图表、日历、聊天、地图、结果与异常页 | `/comp/overview`、`/examples/basic-table`、`/tmpl/cards`、`/tmpl/map`、`/error/404-page` |

可见入口由已安装模块、当前版本和页面权限逻辑共同决定。核心路由在 [src/App.tsx](src/App.tsx)，模块路由由 `module.json` 生成。

## 版本切换

打开 **系统配置 → 版本切换**，或访问 `/system/config?tab=edition`。选择卡片并保存后即时更新菜单、路由和权限展示，不删除业务数据。

| 版本 | 标识 | 默认候选模块 |
| --- | --- | --- |
| 极简版 | `minimal` | 核心工作台与系统管理 |
| ERP 版 | `erp` | erp |
| OA 版 | `oa` | oa |
| SaaS 版 | `saas` | content、media、marketing、analytics、operations、ai |
| 电商版 | `ecommerce` | commerce、erp、marketing、media、analytics |
| 开发者平台版 | `devplatform` | lowcode、server |
| 数据/BI 版 | `bi` | analytics、operations、lowcode |
| 演示版 | `demo` | examples、components、templates，包含现有结果与异常页入口 |
| AI 智能版 | `ai` | ai、lowcode、media |
| CMS 内容版 | `cms` | content、media、marketing |
| CRM 营销版 | `crm` | erp、marketing、analytics、operations、media |
| 全部版 | `full` | 全部已安装模块 |

候选清单会与实际模块求交集；业务版本无可用模块时不显示卡片，极简版与全部版始终保留。当前服务器管理入口属于 `operations`，开发者平台版只开放其中的服务器入口；独立 `commerce` 模块不存在时会从电商清单中剔除。CRM 整体包含 ERP，BI 整体包含低代码中心。

单独版本的功能入口平铺到一级菜单、置于系统管理之前；全部版以 ERP、OA、SaaS、电商等作为一级类别，类别中显示相应功能。共用页面按点击来源保持分类选中状态。

HTTP 预设由后端下发；Mock 和裁剪工具使用 [scripts/edition-presets.json](scripts/edition-presets.json)。调整默认映射时应与后端 `EditionPresets` 同步。

## 按版本裁剪与回退

**版本切换只改变界面入口；裁剪脚本会物理移除模块目录。** 新增的版本裁剪流程会自动创建文件快照，适合将项目精简为 SaaS 等产品形态。

先停止前端开发服务，再执行：

```powershell
# 预览：不修改文件、不创建备份
npm run clean:edition -- --edition=saas --dry-run

# 自动备份后裁剪
npm run clean:edition -- --edition=saas --yes

# 工作区存在未提交修改时，明确允许使用文件快照保护后裁剪
npm run clean:edition -- --edition=saas --yes --allow-dirty

# 查看备份和预览回退
npm run edition:backups
npm run restore:edition -- --dry-run

# 回退最近一次裁剪
npm run restore:edition -- --yes
```

裁剪后启动 `npm run dev:mock` 或 `npm run dev`，前端会**自动启用目标版本**，不需要再手动选择卡片。回退恢复上一次本地版本；之前没有本地版本设置时回到全部版。

- 备份位于 `.edition-backups/`，包含裁剪时的未提交文件，不依赖 Git 提交历史；不要删除该目录。
- 多次裁剪按从新到旧逐次回退；同名目录冲突或备份校验失败时停止，不强制覆盖后续修改。
- `--edition=full` 只保留当前已有模块，不能代替回退。
- 脚本不修改后端、数据库、角色权限或服务器版本配置。
- 不删除 `src/pages` 的共享/历史源码、公共组件或 npm 依赖；被裁剪模块不再进入生成注册表。
- 本地版本记录为 `src/config/build-edition.json`，构建时生成 `src/generated/buildEdition.ts`。管理员之后主动切换版本仍然有效，下一次裁剪或回退会重新应用目标版本。

完整参数、恢复异常处理见 [按版本裁剪与回退](scripts/README-edition.md)。

### 其他清理工具

| 工具 | 用途与恢复方式 |
| --- | --- |
| `clean:edition` / `restore:edition` | 按产品版本移除模块，使用 `.edition-backups` 快照回退 |
| `clean:demo` / `restore:demo` | 历史演示源码清理，按配置与代码标记处理，恢复依赖 Git 历史 |
| `restore:components` / `restore:core` | 历史组件或核心版清理内容的恢复入口 |
| `prune` | 旧的按模块裁剪工具，不提供上述自动快照回退；新操作优先使用 `clean:edition` |
| `clean:dist` | 仅清理构建产物；`clean:dist:dry` 可预览 |

两套源码清理流程不要混用恢复命令。旧流程的范围以 [scripts/clean-demo.config.json](scripts/clean-demo.config.json) 为准，详见 [组件与演示内容清理命令说明](docs/清理组件命令说明.md)。

## ERP CSV 导入与导出

商品、订单、采购、供应商、库存、客户、财务列表提供 **导入 CSV**：

1. 点击“导入 CSV”，下载当前列表的模板。
2. 在表头下填写数据，选择文件。
3. 查看校验结果和预览，确认后导入。
4. 查看成功/失败数量，必要时下载失败报告。

支持中文或英文字段名、UTF-8 / GBK 编码、带引号的逗号及换行；每次最多 500 条、2 MB。导入会校验必填字段、金额、整数、日期、状态和文件内重复 SKU。

- 一般列表按行新增，不覆盖已有数据；失败记录不会撤销此前成功的记录。
- 库存使用 **SKU、方向、数量** 模板，通过入库/出库流水调整，不直接覆盖库存。
- 订单和采购单号由系统生成，CSV 原单号不导入；模板不含商品明细。
- 已完成订单和已入库采购会触发财务记录，需要商品库存联动时应先补齐明细再审批。
- Mock 模式可以演示导入，刷新后数据重置；HTTP 模式通过原有接口权限与后端校验保存。
- 报表中心提供聚合数据导出，不提供报表记录导入。

## 主题与粒子特效

主题设置支持经典蓝、极简黑白、活力紫、漫剧工坊粉、森林绿、日落橙、冰川蓝、玫瑰金，以及深浅模式、菜单布局、侧栏宽度、圆角、标签页样式、水印等选项。

漫剧工坊主题包含：

- 浅色模式：飘落、摇摆的五瓣樱花。
- 深色模式：带紫粉柔光的游动萤火。
- “开启粒子特效”开关和“小 / 中 / 大”尺寸选项，光晕同步缩放。
- 设置即时生效并保存到当前浏览器；特效不拦截鼠标操作。
- 小屏减少粒子数量，页面不可见时暂停；系统开启减少动态效果时隐藏动画。

主题外观页面在 `/system/config?tab=theme`；右上角主题面板提供更多布局与粒子选项。

## API 封装与模块开发

业务 API **统一放在 `src/api/`**。不要在 `src/modules/<module>/api` 重复封装，也不要在页面中直接写后端地址或调用 `fetch`。

```text
页面 / 业务模块
    → src/api/erp.ts、oa.ts、files.ts 等
    → src/api/adapter.ts
    → src/api/adapters/mock.ts 或 http.ts
```

```ts
import { erpApi } from '@/api/erp';
import { oaApi } from '@/api/oa';
// 也可通过 src/api/index.ts 的统一导出使用
```

新增接口时：

1. 在 `src/api/<业务>.ts` 封装调用，在 `src/api/index.ts` 导出。
2. 在 `src/api/adapters/types.ts` 定义适配器契约，在 `src/api/types.ts` 等文件定义数据类型。
3. 同时实现 Mock 和 HTTP 适配，保持返回结构一致。
4. HTTP 接口使用统一请求处理与响应包络 `{ code, message, data }`；真实权限和数据校验由后端执行。
5. 新增可选页面时维护 `src/modules/<module>/module.json` 中的路由、菜单、权限和依赖，然后运行 `npm run generate:registry`。不要手动修改生成文件。

## 项目结构

```text
ao-admin-pro/
├── public/                         # 静态资源
├── scripts/                        # 注册表生成、裁剪、恢复与测试
│   ├── edition-presets.json        # Mock/裁剪预设
│   ├── prune-edition.mjs           # 版本裁剪及回退入口
│   └── README-edition.md           # 裁剪说明
├── src/
│   ├── api/                        # 统一业务 API、类型与数据源适配
│   │   ├── erp.ts / oa.ts          # ERP/OA 调用入口
│   │   └── adapters/               # HTTP、Mock 及演示业务实现
│   ├── config/
│   │   ├── app.json                # 应用配置
│   │   └── mock-auth.json          # 公开的演示登录配置
│   ├── core/                      # 版本过滤、上下文与导航归属
│   ├── generated/                 # 自动生成的模块注册表和本地版本
│   ├── modules/                   # 带 module.json 的可选业务模块
│   ├── pages/                     # 核心页、共享/历史页面和示例
│   ├── components/                # 布局、主题和通用组件
│   ├── hooks/                     # 主题、数据加载等 Hook
│   ├── data/                      # 演示数据
│   ├── i18n/locales/              # 按语言、业务分类的词条
│   ├── lib/                       # 公共工具
│   ├── App.tsx                    # 核心路由与模块路由消费
│   └── main.tsx                   # 应用入口
├── .env.example                   # 常规环境变量示例
├── .env.mock                      # 纯前端演示模式
├── .edition-backups/              # 执行裁剪后生成的本地备份
├── vite.config.ts
└── package.json
```

新增界面文案应使用语言资源；运行时提示可使用 `src/lib/localizedToast.ts`。标签页与面包屑会读取路由标题和模块菜单名称。新增页面后应检查中文及其他语言下的标题和状态显示。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev:mock` | 无后端演示，自动生成注册表 |
| `npm run dev` | 使用常规环境配置启动 |
| `npm run build:mock` | 构建纯前端演示产物到 dist |
| `npm run build` | 使用常规生产环境配置构建，包含 TypeScript 检查 |
| `npm run build:dev` | development 模式构建；必要时先生成注册表 |
| `npm run preview` | 预览已有 dist，不会重新构建 |
| `npm run generate:registry` | 根据已安装模块生成注册表与本地版本 |
| `npm run lint` | ESLint 检查 |
| `npm run clean:saas:dry` | SaaS 裁剪预览 |
| `npm run clean:edition` | 交互选择产品版本并裁剪 |
| `npm run restore:edition -- --yes` | 恢复最近一次版本裁剪 |
| `npm run edition:backups` | 查看版本裁剪备份 |
| `npm run clean:dist:dry` | 预览 dist 清理 |

Windows PowerShell 如受执行策略影响，可将 `npm` 换为 `npm.cmd`。

## 验证命令

在完整模块工作区执行与改动相关的测试：

```powershell
# Mock 登录（含配置账号与错误密码）、ERP/OA、文件和版本切换；禁止后端网络请求
node scripts/test-mock-mode.mjs

# CSV 格式及字段校验
node scripts/test-erp-csv.mjs

# 主题切换、共用路由分类、版本过滤和自动选版
node scripts/test-theme-appearance.mjs
node scripts/test-navigation-group.mjs
node scripts/test-edition.mjs
node scripts/test-build-edition.mjs

# 在临时副本中测试裁剪、真实构建与回退，不裁剪当前源码
node scripts/test-edition-prune.mjs --build

# 最后检查前端产物
npm run build:mock
```

部分测试以完整 ERP/OA/演示模块为前提；如果已经裁剪，请先回退再执行完整回归。自动测试不替代浏览器视觉验收和真实后端联调。

## 构建与部署

```powershell
# 无后端展示站
npm run build:mock
npm run preview

# 后端联调/部署：先配置 VITE_API_MODE=http 与正确的 API 地址
npm run build
```

部署 `dist/` 到静态服务器。项目使用浏览器路由，服务器需要将不存在的前端路径回退到 `index.html`，否则直接打开 `/erp/products` 等深层地址会返回 404。

`VITE_*` 配置在构建时写入前端产物，部署后更改服务器环境变量不会自动改变已构建文件，需要重新构建。不要把后端密钥放入前端环境变量或演示账号配置。

## 更多资料

- [纯前端演示](docs/纯前端演示.md)
- [版本裁剪与回退](scripts/README-edition.md)
- [前后端数据层对接说明](docs/前后端数据层对接说明.md)
- [组件与演示内容清理命令说明](docs/清理组件命令说明.md)
- [项目组件说明](docs/项目组件说明.md)
- [页面与路由说明](docs/页面与路由说明.md)
- [开发运行手册](docs/开发运行手册.md)
- [维护与发布检查清单](docs/维护与发布检查清单.md)

## 许可证

仓库当前未附带许可证文件。公开发布或商业使用前，请按团队规范补充许可证与版权信息。
