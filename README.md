# ao-admin-pro

> 面向中后台场景的 React 管理后台前端模板，内置常用业务页面、权限演示、组件示例、主题配置与丰富交互，适合用作后台项目的原型或二次开发起点。

## 项目说明

ao-admin-pro 基于 React、TypeScript 和 Vite 构建，提供中文界面、响应式布局和可切换主题。项目以本地模拟数据与浏览器状态为主，方便快速预览页面与交互；它不是开箱即用的后端管理系统，因此不包含真实接口、服务端鉴权或数据库。

## 功能一览

| 模块 | 包含内容 |
| --- | --- |
| 数据看板 | 工作台、分析看板、电商看板、访问统计、用户画像、转化漏斗 |
| 内容与营销 | 文章、分类、标签、媒体库、优惠券、活动、推送、订单、消息中心 |
| 系统管理 | 用户、角色、菜单、日志、字典、系统配置、服务器监控、文件管理 |
| 权限管理 | 用户多角色、角色菜单授权、目录 → 菜单 → 按钮三级权限树、前端权限示例 |
| 个人与安全 | 登录/注册、个人中心、头像与资料维护、标签管理、账号安全、设备与登录记录 |
| 组件中心 | 表单、表格、反馈、导航、图标、富文本、二维码、图片裁剪、Excel、词云图等 |
| 页面模板 | 卡片、横幅、图表、日历、聊天、价格、地图（中国地图与世界地图） |
| 界面能力 | 多主题、深浅色、色弱模式、侧栏折叠、标签页、面包屑、水印、圆角、动画、多语言 |
| 常用交互 | 通知消息、全屏、语言偏好、主题面板、AO 助手、图片/文件/表情及颜文字消息 |

## 技术栈

- React 19、TypeScript、Vite 7
- React Router 7、Tailwind CSS 4
- ECharts、ECharts for React、Recharts
- Radix UI、Lucide React
- React Hook Form、Zod、Sonner、XLSX
- i18next、react-i18next

## 环境要求

- Node.js 18+（推荐使用当前 LTS 版本）
- npm 9+

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务
npm run dev
```

浏览器访问 [http://localhost:5174](http://localhost:5174)。开发与预览服务均固定使用 `5174` 端口，并启用了严格端口模式；若端口被占用，请先关闭占用该端口的进程。

首次访问可从以下入口体验：

- 登录页：[http://localhost:5174/login](http://localhost:5174/login)
- 注册页：[http://localhost:5174/register](http://localhost:5174/register)
- 工作台：[http://localhost:5174/](http://localhost:5174/)

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器，端口为 `5174` |
| `npm run build` | 执行类型检查并生成生产构建产物到 `dist/` |
| `npm run build:dev` | 使用 `development` 模式构建 |
| `npm run preview` | 在 `5174` 端口预览生产构建 |
| `npm run lint` | 执行 ESLint 检查 |
| `npm run clean` / `npm run clean:demo` | 打开交互式精简向导，可选择保留哪些演示模块 |
| `npm run clean:dist` | 删除构建产物 `dist/` |
| `npm run clean:dist:dry` | 预览构建产物清理，不修改文件 |
| `npm run clean:demo:dry` | 预览核心版清理范围 |
| `npm run clean:components` | 交互确认后仅移除组件中心，不删除 `src/components` 通用组件 |
| `npm run clean:components:dry` | 预览组件中心清理范围，不修改文件 |
| `npm run restore:components` | 从当前 Git 提交恢复被未提交清理掉的组件页面与入口 |
| `npm run restore:components:dry` | 预览组件恢复范围，不修改文件 |
| `npm run clean:core` | 交互确认后仅保留工作台、系统管理、结果、异常、媒体、订单、消息与组件页面 |
| `npm run clean:core:dry` | 预览核心版清理范围，不修改文件 |
| `npm run clean:basic` | 与 `clean:core` 相同，但跳过交互确认 |
| `npm run clean:basic:dry` | 预览核心版清理范围，不修改文件 |

> Windows PowerShell 如因执行策略无法运行 `npm`，可使用 `npm.cmd run build` 等等效命令。

## 页面入口

| 分类 | 常用路径 |
| --- | --- |
| 账户 | `/login`、`/register`、`/profile`、`/account-security` |
| 看板 | `/`、`/dashboard/analytics`、`/dashboard/ecommerce` |
| 内容与营销 | `/content/articles`、`/content/categories`、`/content/tags`、`/media`、`/marketing/coupons` |
| 系统 | `/system/users`、`/system/roles`、`/system/menus`、`/system/config` |
| 组件中心 | `/comp/overview`、`/comp/forms`、`/comp/table`、`/comp/word-cloud` |
| 功能示例 | `/examples/permissions`、`/examples/basic-table`、`/examples/search-form`、`/examples/socket` |
| 页面模板 | `/tmpl/cards`、`/tmpl/charts`、`/tmpl/chat`、`/tmpl/map` |
| 结果与异常 | `/result/success-page`、`/error/403-page`、`/error/404-page`、`/error/500-page` |

完整路由定义见 [src/App.tsx](src/App.tsx)。

## 项目结构

```text
ao-admin-pro/
├── public/                 # 静态资源
├── scripts/
│   ├── clean-build.mjs     # 构建产物清理脚本
│   └── clean-demo.mjs      # 演示内容精简脚本
├── src/
│   ├── components/         # 布局、导航、主题、消息及通用组件
│   ├── components/ui/      # 基于 Radix UI 封装的基础组件
│   ├── data/               # 模拟数据、聊天数据、中国/世界地图数据
│   ├── hooks/              # 主题、响应式等自定义 Hook
│   ├── i18n/               # i18next 初始化、运行时文本翻译与语言资源
│   │   └── locales/        # 按语言目录、按业务模块拆分的 JSON 词条
│   ├── lib/                # 工具函数、本地账户状态与本地化提示工具
│   ├── pages/              # 业务页、组件示例、功能示例和页面模板
│   ├── App.tsx             # 路由定义
│   └── main.tsx            # 应用入口
├── vite.config.ts          # Vite、别名和开发端口配置
└── package.json            # 依赖与脚本命令
```

## 主题与本地数据

- 主题、布局偏好、个人资料、个人标签、待办以及当前语言会写入浏览器 `localStorage`。
- 登录、注册、权限、列表和图表均使用前端模拟数据；刷新后是否保留，取决于各页面是否使用了本地存储。
- 头像选择仅会转换为本地预览数据，不会上传到远端服务。
- 需要恢复默认展示时，可在浏览器开发者工具中清除本站点的存储数据。

## 多语言

顶部语言菜单、登录注册页语言菜单和“系统设置 → 默认语言”支持以下语言，并会保存到浏览器本地：

- 中文（繁體）
- 中文（简体）
- English
- 日本語
- 한국어
- Français
- Deutsch

项目使用 `i18next` + `react-i18next`。语言资源采用“语言目录 / 页面或业务模块 JSON”的结构，七种语言均保持同一组模块：

```text
src/i18n/
├── index.ts                 # i18next 初始化、语言持久化与回退语言
├── localizeText.ts          # React 树外的共享文本本地化兜底
└── locales/
    ├── zh-CN/
    │   ├── common.json
    │   ├── navigation.json
    │   ├── dashboard.json
    │   ├── analytics.json
    │   ├── ecommerce.json
    │   ├── auth.json
    │   ├── theme.json
    │   └── components.json
    ├── zh-TW/
    ├── en-US/
    ├── ja-JP/
    ├── ko-KR/
    ├── fr-FR/
    └── de-DE/
```

目前已覆盖顶部常用操作、侧边栏与面包屑、多标签页、主题面板、登录/注册、工作台、分析看板、电商看板和组件中心等界面文本。页面组件应通过 `useTranslation()` 的 `t()` 读取词条；运行时通知可使用 `src/lib/localizedToast.ts`，其会对 Sonner 的消息、描述和操作按钮做本地化处理。`src/i18n/localizeText.ts` 为 React 组件树外或尚未结构化的共享文本提供兜底翻译。

新增或迁移页面时，请同时在全部语言目录的对应 JSON 文件中增加相同键名，并避免将显示文本直接硬编码在组件中。当前回退语言为英文；未提供词条时会按 i18next 回退规则显示，因此发布前应在各语言下逐页检查缺失文本。

## 清爽开发模式

若只需删除 Vite 构建产物 `dist/`，可运行 `npm run clean:dist`；可先用 `npm run clean:dist:dry` 预览。它不会改动源码、依赖或演示页面。

若项目进入实际业务开发、无需保留全部演示页面，可使用演示内容精简向导：

```bash
 npm run clean:demo
```

向导支持两种模式：

- **核心版**：保留工作台、系统管理、结果页面、异常页面、媒体库、订单管理、消息中心和组件页面，移除扩展业务模块、功能示例和模板中心。
- **自定义保留模块**：逐项决定是否保留“组件中心”“扩展业务模块”“功能示例”“模板中心”。模板中心包含中国地图、世界地图及其数据文件。

也可以使用非交互命令，便于在自动化流程中执行：

```bash
# 先预览核心版（工作台、系统管理、结果、异常、媒体、订单、消息和组件页面）
npm run clean:core:dry

# 查看计划后交互确认清理
npm run clean:core

# 保留组件中心和模板中心，删除功能示例
npm run clean:demo -- --keep=components,templates --yes

# 预览自定义清理范围，不修改文件
 npm run clean:demo -- --keep=components,templates --dry-run
npm run build
```

若只需清理组件中心，可使用专用命令。脚本会同步移除功能示例中直接引用组件演示页的入口，但不会删除完整的功能示例模块，更不会影响业务通用组件（`src/components/`）。真实执行前会检查 Git 工作区；存在未提交改动时会拒绝执行，除非显式传入 `--allow-dirty`。

```bash
# 预览组件中心及相关功能示例的清理范围
npm run clean:components:dry

# 查看计划后交互确认清理
npm run clean:components
```

可保留或移除模块的标识为 `components`、`extras`、`examples`、`templates`；使用 `--keep=all` 时不会删除任何演示内容。清理会同步移除对应页面目录、地图演示数据、路由导入与侧栏入口。操作不可逆，建议先提交当前代码或创建分支再执行。

> 功能示例会复用组件中心中的部分页面，因此保留 `examples` 时，清理脚本会自动保留 `components`，避免留下无效路由。

清理脚本会先输出保留项、删除项及受影响的文件；带 `--dry-run` 时不会写入或删除任何文件。执行真实清理后，请运行 `npm run build`，并按保留模块检查侧栏菜单和相关路由。

## 二次开发建议

1. 在 `src/App.tsx` 注册新路由，并在 `src/components/Sidebar.tsx` 增加相应导航项。
2. 将 `src/data` 内的模拟数据替换为接口层；建议集中封装请求、错误处理与数据类型。
3. 接入实际登录态、路由守卫和后端权限校验。前端按钮权限仅作为界面展示与交互控制，不能替代服务端鉴权。
4. 按业务需求将个人资料、主题偏好等 `localStorage` 状态迁移至服务端。
5. 每次改动后运行 `npm run lint` 和 `npm run build`，确保代码质量与生产构建正常。

## 浏览器支持

建议使用最新版 Chrome、Edge、Firefox 或 Safari。为获得完整体验，请确保浏览器允许 `localStorage`、剪贴板与文件选择等基础能力。

## 许可证

仓库当前未附带许可证文件。用于公开发布或商业项目之前，请根据团队规范补充合适的许可证与版权信息。
