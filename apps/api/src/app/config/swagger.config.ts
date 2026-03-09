import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'

import { ProblemDetailsDto } from '@/shared-kernel/infrastructure/dtos/problem-details.dto'

import type { INestApplication } from '@nestjs/common'
import type { OpenAPIObject, SwaggerCustomOptions } from '@nestjs/swagger'

/**
 * Swagger base configuration
 */
export const swaggerConfig = {
  title: 'NestJs API',
  description: 'NestJS modular layered architecture example project API documentation',
  version: '1.0',
}

/**
 * Swagger UI custom configuration options
 */
export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
}

/**
 * Add a generic default error response to all endpoints
 *
 * Uses the OpenAPI default response feature to automatically add the standard
 * Problem Details error response format (RFC 9457) to all undefined status codes.
 *
 * @param document - OpenAPI document object
 */
function addDefaultErrorResponses(document: OpenAPIObject): void {
  if (!document.paths) return

  for (const path in document.paths) {
    const pathItem = document.paths[path]
    if (!pathItem) continue

    for (const method in pathItem) {
      // Skip non-HTTP method properties (e.g. parameters, servers)
      if (!['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method)) {
        continue
      }

      const operation = pathItem[method as keyof typeof pathItem]
      if (!operation || typeof operation !== 'object' || !('responses' in operation)) {
        continue
      }

      // Skip if a default response is already defined
      if (operation.responses && !operation.responses.default) {
        operation.responses.default = {
          description: 'Error response (includes 400/401/403/404/422/429/500, etc.)',
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
 * Set up API documentation
 *
 * - /docs - Scalar API Reference (default)
 * - /swagger - Swagger UI (fallback)
 */
export function setupSwagger(app: INestApplication): void {
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

  // Add generic default error response to all endpoints
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
