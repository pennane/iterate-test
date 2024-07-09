import { Message, Org, User } from './model'
import { key, randomDelay } from './util'

async function getOrgs(): Promise<Org[]> {
  const n = 5

  const out = []
  for (let i = 0; i < n; i++) {
    out.push({ id: i })
  }

  return out
}

async function getUsers(org: Org): Promise<User[]> {
  await randomDelay()
  const n = 5

  const out = []
  for (let i = 0; i < n; i++) {
    const user = { id: i, orgId: org.id }
    out.push(user)
  }

  return out
}

async function getMessages(user: User): Promise<Message[]> {
  await randomDelay()
  const n = 5

  const out = []
  for (let i = 0; i < n; i++) {
    const message = { id: i, userId: user.id, orgId: user.orgId }
    out.push(message)
  }

  return out
}

async function* getMessagesPipeline() {
  const orgs = await getOrgs()

  const promises = new Map<string, Promise<[string, User[] | Message[]]>>(
    orgs.map(getUsers).map((p, i) => key(`users-${i}`, p))
  )

  while (promises.size > 0) {
    const [k, items] = await Promise.race(promises.values())
    promises.delete(k)
    if (k.startsWith('users')) {
      const users = items as User[]
      for (const [i, user] of users.entries()) {
        const p = getMessages(user)
        const k2 = key(`messages-${k}-${i}`, p)
        promises.set(k2[0], k2[1])
      }
    } else if (k.startsWith('messages')) {
      const messages = items as Message[]
      yield messages
    }
  }
}

export async function run() {
  for await (const messages of getMessagesPipeline()) {
    const { orgId, userId } = messages[0]
    console.log({ orgId, userId })
  }
}
