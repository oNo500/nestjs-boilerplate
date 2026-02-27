import type { Slug } from '@/modules/article/domain/value-objects/slug.vo'

/**
 * Slug Generator interface
 *
 * Defines the abstract interface for the slug generation service.
 */
export interface SlugGenerator {
  /**
   * Generate a slug from a title.
   *
   * @param title Article title
   * @returns URL-friendly slug
   */
  generate(title: string): Slug

  /**
   * Generate a unique slug (appends a suffix if the slug already exists).
   *
   * @param baseSlug Base slug
   * @param checkExists Function that checks whether a slug already exists
   * @returns Unique slug
   */
  generateUnique(
    baseSlug: string,
    checkExists: (slug: string) => Promise<boolean>,
  ): Promise<Slug>
}

/**
 * SlugGenerator injection token
 */
export const SLUG_GENERATOR = Symbol('SLUG_GENERATOR')
