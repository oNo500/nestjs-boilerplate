import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'

import metadata from '@/metadata'
import { ProblemDetailsDto } from '@/shared-kernel/infrastructure/dtos/problem-details.dto'

import type { INestApplication } from '@nestjs/common'
import type { OpenAPIObject, SwaggerCustomOptions } from '@nestjs/swagger'

/**
 * Swagger base config
 */
export const swaggerConfig = {
  title: 'NestJS API',
  description: 'NestJS modular layered architecture API',
  version: '1.0',
}

/**
 * Swagger UI custom options
 */
export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
}

/**
 * API version header config
 */
export const apiVersionConfig = {
  type: 'apiKey' as const,
  name: 'API-Version',
  in: 'header' as const,
  description: 'Optional API version header (e.g., 2024-11-01)',
}

/**
 * Add default error responses to all endpoints (RFC 9457 Problem Details)
 */
function addDefaultErrorResponses(document: OpenAPIObject): void {
  if (!document.paths) return

  for (const path in document.paths) {
    const pathItem = document.paths[path]
    if (!pathItem) continue

    for (const method in pathItem) {
      // Skip non-HTTP method properties
      if (!['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method)) {
        continue
      }

      const operation = pathItem[method as keyof typeof pathItem]
      if (!operation || typeof operation !== 'object' || !('responses' in operation)) {
        continue
      }

      // Skip if default response already defined
      if (operation.responses && !operation.responses.default) {
        operation.responses.default = {
          description: 'Error response (400/401/403/404/422/429/500 etc.)',
          content: {
            'application/problem+json': {
              schema: {
                $ref: '#/components/schemas/ProblemDetailsDto',
              },
            },
          },
        }
      }
    }
  }
}

/**
 * Setup API documentation
 * - /docs - Scalar API docs (default)
 * - /swagger - Swagger UI (fallback)
 */
export async function setupSwagger(app: INestApplication): Promise<void> {
  await SwaggerModule.loadPluginMetadata(metadata)

  const config = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development')
    .addTag('health', 'Health check endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addTag('todos', 'Todo management endpoints')
    .addTag('articles', 'Article management endpoints')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config, {
    include: [],
    deepScanRoutes: true,
    extraModels: [ProblemDetailsDto],
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
  })

  addDefaultErrorResponses(document)

  SwaggerModule.setup('swagger', app, document, {
    ...swaggerCustomOptions,
    yamlDocumentUrl: '/openapi.yaml',
  })

  app.use(
    '/docs',
    apiReference({
      content: document,
    }),
  )
}
