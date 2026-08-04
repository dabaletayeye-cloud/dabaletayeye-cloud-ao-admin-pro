# ao-admin-pro

> 面向中后台场景的 React 管理后台前端模板，内置常用业务页面、权限演示、组件示例、主题配置与丰富交互，适合用作后台项目的原型或二次开发起点。

## 项目说明

ao-admin-pro 基于 React、TypeScript 和 Vite 构建，提供中文界面、响应式布局和可切换主题。项目以本地模拟数据与浏览器状态为主，方便快速预览页面与交互；它不是开箱即用的后端管理系统，因此不包含真实接口、服务端鉴权或数据库。

## 功能一览

| 模块 | 包含内容 |
| --- | --- |
| 数据看板 | 工作台、分析看板、电商看板、访问统计、用户画像、转化漏斗 |
| 内容与营销 | 文章、分类、标签、媒体库、优惠券、活动、推送、订单、消息中心 |
| 系统管理 | 用户、角色、菜单、日志、字典、系统配置、服务器监控 |
| 权限管理 | 用户多角色、角色菜单授权、目录 → 菜单 → 按钮三级权限树、前端权限示例 |
| 个人与安全 | 登录/注册、个人中心、头像与资料维护、标签管理、账号安全、设备与登录记录 |
| 组件中心 | 表单、表格、反馈、导航、图标、富文本、二维码、图片裁剪、Excel、词云图等 |
| 页面模板 | 卡片、横幅、图表、日历、聊天、价格、地图（中国地图与世界地图） |
| 界面能力 | 多主题、深浅色、色弱模式、侧栏折叠、标签页、面包屑、水印、圆角、动画 |
| 常用交互 | 通知消息、全屏、语言偏好、主题面板、AO 助手、图片/文件/表情消息 |

## 技术栈

- React 19、TypeScript、Vite 7
- React Router 7、Tailwind CSS 4
- ECharts、ECharts for React、Recharts
- Radix UI、Lucide React
- React Hook Form、Zod、Sonner、XLSX

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
| `npm run clean:demo:dry` | 预览演示内容清理范围，不修改文件 |
| `npm run clean:demo` | 清理组件中心、功能示例、模板中心及关联地图演示 |

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
│   └── clean-demo.mjs      # 演示内容清理脚本
├── src/
│   ├── components/         # 布局、导航、主题、消息及通用组件
│   ├── components/ui/      # 基于 Radix UI 封装的基础组件
│   ├── data/               # 模拟数据、聊天数据、中国/世界地图数据
│   ├── hooks/              # 主题、响应式等自定义 Hook
│   ├── lib/                # 工具函数与本地账户状态
│   ├── pages/              # 业务页、组件示例、功能示例和页面模板
│   ├── App.tsx             # 路由定义
│   └── main.tsx            # 应用入口
├── vite.config.ts          # Vite、别名和开发端口配置
└── package.json            # 依赖与脚本命令
```

## 主题与本地数据

- 主题、布局偏好、个人资料、个人标签、待办等演示状态会写入浏览器 `localStorage`。
- 登录、注册、权限、列表和图表均使用前端模拟数据；刷新后是否保留，取决于各页面是否使用了本地存储。
- 头像选择仅会转换为本地预览数据，不会上传到远端服务。
- 需要恢复默认展示时，可在浏览器开发者工具中清除本站点的存储数据。

## 清爽开发模式

若项目进入实际业务开发、无需保留演示页面，可先查看清理范围：

```bash
npm run clean:demo:dry
```

确认后执行：

```bash
npm run clean:demo
npm run build
```

该命令会删除 `src/pages/comp`、`src/pages/examples`、`src/pages/tmpl`、地图演示数据及其路由、侧栏入口。操作不可逆，建议先提交当前代码或创建分支再执行。

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
