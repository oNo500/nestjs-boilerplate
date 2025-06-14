## 架构思想

### 1. 洋葱模型与 DDD 的核心思想

- **洋葱模型**：强调"依赖规则"，即越核心的层（如领域模型）不依赖外层，外层依赖内层。通常分为：
  - **Domain（领域层）**：实体、聚合、领域服务
  - **Application（应用层）**：用例、流程编排
  - **Infrastructure（基础设施层）**：数据库、第三方服务、框架集成
  - **Interface（接口层）**：API、UI、外部适配器

- **DDD**：强调以领域为中心，分为领域层、应用层、基础设施层、接口层，鼓励将通用能力和领域能力分离。

---

### 2. 分层架构

```text
src/
├── core/      # 核心能力（如日志、守卫、装饰器、限流等，偏基础设施/技术层）
├── shared/    # 可复用的通用模块（如认证、健康检查、工具、事件、定时任务等）
├── features/  # 业务功能模块（如用户模块，偏领域/应用层）
├── database/  # 数据库相关（schema、migrations，偏基础设施层）
├── config/    # 配置
```

- **features/**：对应 DDD 的领域层和应用层，每个子目录可视为一个"限界上下文"。
- **core/**：偏向基础设施层，提供全局技术能力（如日志、守卫、装饰器等），不直接承载业务逻辑。
- **shared/**：介于基础设施层和领域服务层之间，提供可复用的通用能力（如认证、健康检查、工具等）。
- **database/**：纯粹的基础设施层，负责数据持久化。
- **config/**：配置管理，属于基础设施支撑。

> **core 与 shared 的边界分析**

---

### 下一步

1. 集成数据库
2. 验证数据库连接
3. 重新设计数据库
4. 集成权限
5. 集成邮箱
6. 用户接口示例
7. 登录注册

> 脚手架暂时就先这些吧。然后发在 GitHub，然后开始项目吧。

---

## REST API 响应规范

**参考：**

- [JSend](https://github.com/omniti-labs/jsend)
- [Google AIP-193](https://google.aip.dev/193)

#### 成功

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe"
  }
}
```

#### 失败

```json
{
  "success": false,
  "error": {
    "code": "",
    "message": "",
    "detail": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

#### 错误

```json
{}
```

---

## 资料标准

### 1. 官方标准和协议 (Formal Specifications)

- **HTTP 协议 (RFC 7231 等)**
  - HTTP 状态码：2xx 成功，4xx 客户端错误，5xx 服务端错误
  - HTTP 方法：GET、POST、PUT、DELETE 等
  - HTTP 头部：Content-Type、Authorization、Accept 等
- **RFC 7807**：HTTP 错误响应的标准 JSON 结构，也称为 problem+json
- **数据格式规范**：如 JSON (RFC 8259)

### 2. 社区驱动的设计模式 (Community-Driven Patterns)

- **JSend**：简单专注的 JSON 响应结构
- **JSON:API**：全面、严格的 API 规范
- **GraphQL 错误处理**：统一的 errors 键下返回错误对象数组

### 3. 头部公司的公开实践 (Influential Company Practices)

- **Stripe API**：开发者体验黄金标准，[错误码设计](https://docs.stripe.com/api/errors)清晰
- **Google Cloud API Design Guide**：详细的 [API 设计指南](https://cloud.google.com/apis/design?hl=zh-cn)
- **Microsoft REST API Guidelines**：详尽的 [REST API 指南](https://github.com/microsoft/api-guidelines)

## 建并维护 API 错误代码中央注册表

| Code (错误代码)                 | HTTP Status | 描述 (说明在什么情况下发生)                                        |
| :------------------------------ | :---------- | :----------------------------------------------------------------- |
| **`VALIDATION_ERROR`** | 400         | 一个或多个输入字段未能通过验证。                                   |
| `FIELD_REQUIRED`                | 400         | 请求中缺少必需的字段。具体字段应在 `details` 中指明。              |
| `INVALID_FORMAT`                | 400         | 字段值的格式不正确（例如，无效的邮箱或日期）。                     |
| `UNAUTHENTICATED`               | 401         | 请求缺少有效的身份验证凭据。                                       |
| `TOKEN_EXPIRED`                 | 401         | 提供的身份验证令牌已过期，客户端应尝试刷新令牌或重新登录。         |
| `INSUFFICIENT_PERMISSIONS`      | 403         | 用户已通过身份验证，但无权执行当前操作。                           |
| `RESOURCE_NOT_FOUND`            | 404         | 在服务器上找不到请求的资源（例如，根据 ID 查询用户但用户不存在）。 |
| `INTERNAL_SERVER_ERROR`         | 500         | 服务器遇到了一个意外的内部错误。这通常是一个 bug。                   |

yaml 格式

```yaml
# API Error Codes Registry
# This file is the single source of truth for all API error codes.

VALIDATION_ERROR:
  status: 400
  description: "一个或多个输入字段未能通过验证。"

FIELD_REQUIRED:
  status: 400
  description: "请求中缺少必需的字段。具体字段应在 details 中指明。"

UNAUTHENTICATED:
  status: 401
  description: "请求缺少有效的身份验证凭据。"

RESOURCE_NOT_FOUND:
  status: 404
  description: "在服务器上找不到请求的资源。"

INTERNAL_SERVER_ERROR:
  status: 500
  description: "服务器遇到了一个意外的内部错误。这通常是一个 bug。"

```


Service 层的职责：
	•	负责业务逻辑处理，比如：
	•	数据库操作
	•	业务校验
	•	资源状态检查

可以抛 Nest 的 HTTP 异常，也可以抛自定义异常，再交给上层 Controller 或全局过滤器处理
    

 Controller 层的职责：
	•	负责接收请求、调用 service、处理返回值
	•	主要处理与HTTP 协议相关的异常，比如：
	•	请求参数格式错误（可以交给管道）
	•	权限不足（可交给守卫）
	•	捕获 service 抛出的业务异常，决定是否直接响应或包装后返回