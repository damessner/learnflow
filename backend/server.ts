import dotenv from 'dotenv'
dotenv.config()

import { createApp } from './app'
import { initDB } from './db/init'
import { seedDB } from './db/seed'
import { closeKnex } from './db/knex'
import logger from './lib/logger'

async function main(): Promise<void> {
  await initDB()
  await seedDB()

  const app = createApp()
  const port = parseInt(process.env.PORT || '3001', 10)

  const server = app.listen(port, () => {
    logger.info(`Server running on port ${port}`)
  })

  const shutdown = async () => {
    logger.info('Shutting down...')
    server.close()
    await closeKnex()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start server')
  process.exit(1)
})
