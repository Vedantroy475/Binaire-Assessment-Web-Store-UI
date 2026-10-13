import type { PaginationState } from '@/types'

/**
 * Pagination - a from-scratch pagination controller.
 *
 * The brief forbids using React's built-in methodology or any external library
 * for pagination. This class owns all page state and maths; React simply reads
 * from it and calls its methods. Pure logic, fully unit-testable.
 */
export class Pagination<T> {
  private items: T[]
  private _pageSize: number
  private _page: number

  constructor(items: T[] = [], pageSize = 20) {
    this.items = items
    this._pageSize = pageSize
    this._page = 1
  }

  setItems(items: T[]): void {
    this.items = items
    // Keep the current page valid when the dataset changes.
    if (this._page > this.totalPages) {
      this._page = Math.max(1, this.totalPages)
    }
  }

  setPageSize(size: number): void {
    this._pageSize = size
    if (this._page > this.totalPages) this._page = Math.max(1, this.totalPages)
  }

  get page(): number {
    return this._page
  }

  get pageSize(): number {
    return this._pageSize
  }

  get totalItems(): number {
    return this.items.length
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.items.length / this._pageSize))
  }

  get state(): PaginationState {
    return {
      page: this._page,
      totalPages: this.totalPages,
      totalResults: this.items.length,
      hasNext: this._page < this.totalPages,
      hasPrevious: this._page > 1,
    }
  }

  /** Items for the current page. */
  currentPageItems(): T[] {
    const start = (this._page - 1) * this._pageSize
    return this.items.slice(start, start + this._pageSize)
  }

  /** A slice of page numbers to render in the pager (windowed around current). */
  pageNumbers(window = 2): number[] {
    const total = this.totalPages
    const start = Math.max(1, this._page - window)
    const end = Math.min(total, this._page + window)
    const pages: number[] = []
    for (let p = start; p <= end; p += 1) pages.push(p)
    return pages
  }

  goTo(page: number): boolean {
    const clamped = Math.min(Math.max(1, page), this.totalPages)
    if (clamped === this._page) return false
    this._page = clamped
    return true
  }

  next(): boolean {
    return this.goTo(this._page + 1)
  }

  previous(): boolean {
    return this.goTo(this._page - 1)
  }

  first(): boolean {
    return this.goTo(1)
  }

  last(): boolean {
    return this.goTo(this.totalPages)
  }
}
