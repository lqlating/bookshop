# My-demo

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests

```sh
# Run all tests once
npm run test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 单元测试

本项目使用 Vitest 进行单元测试，所有组件都有对应的测试文件。

### 测试覆盖组件

- **个人资料相关**:
  - `EditProfile.vue`：测试表单验证、违禁词检测和提交功能
  - `Me.vue`：测试用户信息展示、交互逻辑和路由导航

- **登录注册相关**:
  - `Login.vue`：测试登录表单、验证和提交
  - `Register.vue`：测试注册表单、验证和提交

- **发现页面相关**:
  - `Discover.vue`：测试文章列表、搜索功能和视图切换
  - `ArticleDisplay.vue`：测试文章卡片的显示和交互
  - `UserList.vue`：测试用户列表的显示和交互

- **评论相关**:
  - `Comment.vue`：测试评论列表加载、提交评论、删除评论等功能
  - `replyPart.vue`：测试回复功能、回复列表等功能

### API 测试

- `axiosInstance.js`：测试 axios 配置和拦截器设置

### 工具函数测试

- `formValidation.js`：测试表单验证函数、违禁词检测和过滤功能

### 测试文件组织

测试文件位于 `src/tests` 目录下，按照源代码的目录结构组织：

```
src/tests/
├── api/                   # API 测试
├── components/            # 组件测试
│   ├── profile/           # 个人资料组件测试
│   ├── login/             # 登录注册组件测试
│   ├── discover/          # 发现页面组件测试
│   ├── comment/           # 评论组件测试
│   └── ...                # 其他组件测试
├── utils/                 # 工具函数测试
└── templates/             # 测试模板
    └── component-test-template.js  # 组件测试模板
```

### 使用测试模板

为了简化测试编写，我们提供了一个通用的组件测试模板文件 `src/tests/templates/component-test-template.js`。使用该模板可以快速创建新的组件测试。

### 测试覆盖率

使用 `npm run test:coverage` 可以生成测试覆盖率报告，查看项目的测试覆盖情况。
