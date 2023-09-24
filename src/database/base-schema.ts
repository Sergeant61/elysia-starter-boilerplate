import { z } from 'zod'

export const BaseSchema = z.object({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

export const PaginationSchema = z.object({
  page: z.number(),
  size: z.number(),
  total: z.number().default(0),
  totalPage: z.number().default(0),
})

export const SortingSchema = z.record(z.string(), z.number().int().gte(-1).lte(1))
export const FilteringSchema = z.record(z.string(), z.any())
export const FieldSchema = z.record(z.string(), z.number().int().gte(0).lte(1))

export const RequestOptionsSchema = z.object({
  pagination: PaginationSchema.optional(),
  sorting: SortingSchema.optional(),
  filtering: FilteringSchema.optional(),
  fields: FieldSchema.optional(),
})

export type TRequestOptions = z.infer<typeof RequestOptionsSchema>
export type TOptionSorting = z.infer<typeof SortingSchema>
export type TOptionPagination = z.infer<typeof PaginationSchema>
export type TOptionFiltering = z.infer<typeof FilteringSchema>
export type TOptionField = z.infer<typeof FieldSchema>

export interface IResponseOptions {
  options: {
    pagination: TOptionPagination
    sorting: TOptionSorting
  }
}

export type TResponseList<T, K extends string> = { [P in K]: T[] } & IResponseOptions
