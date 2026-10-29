import { test as base } from '@playwright/test'
import fs from 'fs'

type Fixtures = { authToken: string }

export const test = base.extend<Fixtures>({
  authToken: async ({}, use) => {
    const user = JSON.parse(fs.readFileSync('playwright/.auth/user.json', 'utf-8'))
    const token = user.origins[0].localStorage.find((i: any) => i.name === 'jwtToken')?.value
    if (!token) throw new Error('jwtToken não encontrado em playwright/.auth/user.json')
    await use(token)
  }
})
export { expect } from '@playwright/test'