export type Indexed<T> = [number, Promise<[number, T]>]
export type Keyed<T> = [string, Promise<[string, T]>]

// just mocking
export type Org = { id: number }
export type User = { id: number; orgId: number }
export type Message = { id: number; userId: number; orgId: number }
