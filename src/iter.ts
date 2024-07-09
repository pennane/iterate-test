import { Org, User, Message } from './model'
import { index, isAsyncIterable, random, randomDelay, wait } from './util'

async function* concurrent<T>(xs: Iterable<Promise<T>>) {
  const pool = new Map<number, Promise<[number, T]>>()

  let n = 1
  for (const x of xs) {
    const idx = index(n, x)
    pool.set(idx[0], idx[1])
    n++
  }

  while (pool.size !== 0) {
    const [idx, res] = await Promise.race(pool.values())

    pool.delete(idx)

    yield res
  }
}

async function* map<A, B>(f: (a: A) => B, xs: AsyncIterable<A>) {
  for await (const x of xs) {
    yield f(x)
  }
}

async function* chain<A, B>(
  f: (a: A) => AsyncIterable<B>,
  xs: AsyncIterable<A>
) {
  for await (const x of xs) {
    const y = f(x)
    if (!isAsyncIterable(y)) {
      throw new Error('did not receive an async iterable')
    }
    yield* y
  }
}

async function* getOrgs(): AsyncGenerator<Org> {
  await randomDelay()
  const n = 5

  for (let i = 0; i < n; i++) {
    yield { id: i }
  }
}

async function* getUsers(org: Org): AsyncGenerator<User> {
  await randomDelay()
  const n = 5
  for (let i = 0; i < n; i++) {
    const user = { id: i, orgId: org.id }
    yield user
  }
}

function* getMessages(user: User): Generator<Promise<Message>> {
  const n = 5
  for (let i = 0; i < n; i++) {
    const message = { id: i, userId: user.id, orgId: user.orgId }
    yield new Promise((res) => {
      wait(random(100, 300)).then(() => res(message))
    })
  }
}

export async function run() {
  const orgs = getOrgs()
  const users = chain(getUsers, orgs)
  const mails = chain((user) => concurrent(getMessages(user)), users)

  for await (const mail of mails) {
    console.log(mail)
  }
}
