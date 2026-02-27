import { delay, http } from 'msw'

import { articlesHandlers } from './articles'
import { dashboardHandlers } from './dashboard'
import { profileHandlers } from './profile'
import { usersHandlers } from './users'

export const handlers = [
  http.all('*', async () => {
    await delay(300)
  }),
  ...usersHandlers,
  ...profileHandlers,
  ...articlesHandlers,
  ...dashboardHandlers,
]
