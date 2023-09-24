import { Model } from "mongoose"
import { TOptionField, TOptionFiltering, TOptionPagination, TOptionSorting, TResponseList } from "./base-schema"

export const FindByIndex = async <T, K extends string>(_collection: Model<T>, _query: Record<string, any>, _options: { filtering?: TOptionFiltering & { q?: string }, pagination?: TOptionPagination, sorting?: TOptionSorting, fields?: TOptionField }, indexes: string[] = [], wrapperFieldName: K) => {
  const result: TResponseList<T, K> = {
    options: {
      pagination: {
        page: 1,
        size: 10,
        total: 0,
        totalPage: 0,
      },
      sorting: {
        createdAt: -1
      },
    },
    [wrapperFieldName]: [],
  } as TResponseList<T, K>

  let query = _query

  if (_options?.filtering) {
    const q = _options.filtering.q

    if (q) {
      query = { $or: [{ $text: { $search: q } }] }

      indexes.map(index => {
        const obj: any = {}
        obj[index] = { $regex: q, $options: "i" }
        query.$or.push(obj)
      })
    }

    const filterQuery = Object.keys(_options.filtering).reduce(function (obj: Record<string, any>, key) {
      if (key === 'q') {
        return obj
      }

      if (_options.filtering) {
        obj[key] = _options.filtering[key]
      }

      return obj
    }, {})

    query = { ...filterQuery, ...query }
  }

  const count = await _collection.countDocuments(query)
  result.options.pagination.page = 1
  result.options.pagination.size = count
  result.options.pagination.total = count

  const options: any = {}

  if (_options?.pagination) {
    options.skip = (_options.pagination.page - 1) * _options.pagination.size
    options.limit = _options.pagination.size
    result.options.pagination.page = _options.pagination.page
    result.options.pagination.size = _options.pagination.size
  }

  result.options.pagination.totalPage = Math.ceil(result.options.pagination.total / result.options.pagination.size)

  if (_options?.sorting) {
    options.sort = _options.sorting
    result.options.sorting = _options.sorting
  }

  result[wrapperFieldName] = await _collection.find(query, _options?.fields || {}, options).exec() as TResponseList<T, K>[K]
  return result
}