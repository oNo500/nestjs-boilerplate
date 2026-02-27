import { Injectable } from '@nestjs/common'

import { Slug } from '@/modules/article/domain/value-objects/slug.vo'

import type { SlugGenerator } from '@/modules/article/application/ports/slug-generator.port'

/**
 * Slug Generator Service implementation
 *
 * Converts a title into a URL-friendly slug.
 */
@Injectable()
export class SlugGeneratorService implements SlugGenerator {
  /**
   * Generate a slug from a title.
   *
   * Strategy:
   * 1. Convert to lowercase
   * 2. Remove special characters
   * 3. Replace spaces with hyphens
   * 4. Collapse consecutive hyphens into one
   */
  generate(title: string): Slug {
    let slug = title
      .toLowerCase()
      .trim()
      // Keep only letters, digits, spaces, and hyphens
      .replaceAll(/[^\da-z\s-]/g, '')
      // Replace spaces with hyphens
      .replaceAll(/\s+/g, '-')
      // Collapse multiple hyphens into one
      .replaceAll(/-+/g, '-')
      // Strip leading and trailing hyphens
      .replaceAll(/^-+|-+$/g, '')

    // Fall back to a timestamp-based slug if the result is empty or too short
    if (slug.length < 3) {
      slug = `article-${Date.now()}`
    }

    return Slug.create(slug)
  }

  /**
   * Generate a unique slug.
   *
   * Appends a numeric suffix if the slug already exists.
   */
  async generateUnique(
    baseSlug: string,
    checkExists: (slug: string) => Promise<boolean>,
  ): Promise<Slug> {
    let slug = baseSlug
    let counter = 1

    // Append an incrementing suffix until the slug is unique
    while (await checkExists(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return Slug.create(slug)
  }
}
