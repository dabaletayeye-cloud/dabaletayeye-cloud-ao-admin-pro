# ao-admin-pro

一个基于 React、TypeScript 与 Vite 构建的后台管理界面示例项目，涵盖数据看板、内容与营销管理、系统权限、组件中心、业务模板和功能示例等常见后台场景。

> 本项目当前以本地模拟数据和前端状态为主，用于界面展示与交互演示；未包含服务端接口、鉴权服务或持久化数据库。

## 功能概览

- **数据看板**：综合首页、分析看板、电商看板、访问统计、用户画像和转化漏斗。
- **业务管理**：文章、分类、标签、媒体库、优惠券、活动、推送、订单与站内消息。
- **系统管理**：用户、角色、菜单、日志、字典、系统配置与服务器监控页面。
- **权限演示**：用户支持多个角色；角色可通过“模块 → 菜单 → 按钮”三级树分配菜单与按钮权限；菜单管理支持目录、菜单和按钮层级。
- **组件中心**：表单、表格、反馈、导航、图标、富文本、二维码、图片裁剪、Excel、词云图等组件示例。
- **模板页面**：卡片、横幅、图表、日历、聊天、价格和地图模板；地图模板包含中国地图与世界地图。
- **功能示例**：前端权限、多标签页、基础/高级表格、表单、搜索表单、分割表格与 Socket 界面示例。
- **主题与布局**：支持多种皮肤、深浅色、侧边栏折叠、标签页、面包屑、色弱模式、水印、圆角、页面动画等设置，并将配置保存到浏览器 `localStorage`。
- **快捷交互**：消息面板、全屏、语言偏好、主题设置与 AO 助手。AO 助手支持文本、表情、颜文字、图片和文件附件消息。

## 技术栈

- React 19 + TypeScript
- Vite 7
- React Router 7
- Tailwind CSS 4
- Radix UI、Lucide React
- ECharts / ECharts for React、Recharts
- React Hook Form、Zod
- Sonner、XLSX

## 环境要求

- Node.js 18 或更高版本（推荐使用当前 LTS）
- npm 9 或更高版本

## 快速开始

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

启动后访问 [http://localhost:5174](http://localhost:5174)。开发服务器已在 `vite.config.ts` 中固定为 `5174` 端口，并启用严格端口模式；端口被占用时请先释放该端口。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（端口 `5174`） |
| `npm run build` | 生成生产构建产物 |
| `npm run build:dev` | 使用 development 模式构建 |
| `npm run preview` | 本地预览构建产物（端口 `5174`） |
| `npm run lint` | 执行 ESLint 检查 |

## 主要页面入口

| 模块 | 示例路径 |
| --- | --- |
| 首页与看板 | `/`、`/dashboard/analytics`、`/dashboard/ecommerce` |
| 内容与营销 | `/content/articles`、`/media`、`/marketing/coupons` |
| 系统管理 | `/system/users`、`/system/roles`、`/system/menus` |
| 组件中心 | `/comp/overview`、`/comp/table`、`/comp/word-cloud` |
| 功能示例 | `/examples/permissions`、`/examples/basic-table`、`/examples/socket` |
| 页面模板 | `/tmpl/cards`、`/tmpl/charts`、`/tmpl/map` |
| 结果与错误页 | `/result/success-page`、`/error/403-page`、`/error/404-page`、`/error/500-page` |

## 项目结构

```text
src/
├── components/       # 布局、导航、主题面板、聊天助手及通用界面组件
├── components/ui/    # 基于 Radix UI 封装的基础组件
├── data/             # 模拟数据、聊天数据及中国/世界地图 GeoJSON
├── hooks/            # 主题、响应式等自定义 Hook
├── lib/              # 工具函数
├── pages/            # 业务页面、组件示例、功能示例与模板页面
├── types.ts          # 公共类型定义
├── App.tsx           # 路由定义
└── main.tsx          # 应用入口
```

## 数据与状态说明

- 列表、图表、权限和消息等内容使用 `src/data` 中的模拟数据，页面操作主要更新当前浏览器会话内的前端状态。
- 用户头像上传仅用于本地预览，不会上传至远端服务，也不会在刷新页面后保留。
- 主题及布局偏好会保存在浏览器 `localStorage` 中，可通过主题设置面板重置。

## 开发说明

- 路由集中定义在 `src/App.tsx`，新增页面时请同时补充对应路由与侧边导航配置。
- 使用 `@/` 作为 `src/` 目录别名。
- 生产部署前请按实际后端接口、鉴权策略和持久化方案替换现有模拟数据与本地交互逻辑。
