import { loadDatabaseAdapter } from './database.client'
import { useRuntimeConfig, refreshNuxtData } from '#imports'

const logger = {
  log: (...args: unknown[]) => console.log('[Content]', ...args),
  warn: (...args: unknown[]) => console.warn('[Content]', ...args),
}

let ws: WebSocket | undefined

export function useContentWebSocket() {
  if (!window.WebSocket) {
    logger.warn('Could not enable hot reload, your browser does not support WebSocket.')
    return
  }

  const onMessage = async (message: { data: string }) => {
    try {
      const data = JSON.parse(message.data)

      if (!data || !data.queries) {
        return
      }

      const db = await loadDatabaseAdapter()

      for (const s of data.queries) {
        await db.exec(s).catch((err: unknown) => console.log(err))
      }
      console.log('updated', data.queries)

      refreshNuxtData()
    }
    catch {
      // Do nothing
    }
  }

  const onOpen = () => logger.log('WS connected!')

  const onError = (e: Event) => {
    switch ((e as unknown as { code: string }).code) {
      case 'ECONNREFUSED':
        connect(true)
        break
      default:
        logger.warn('WS Error:', e)
        break
    }
  }

  const onClose = (e: { code?: number }) => {
    // https://tools.ietf.org/html/rfc6455#section-11.7
    if (e.code === 1000 || e.code === 1005) {
      // Normal close
      logger.log('WS closed!')
    }
    else {
      // Unkown error
      connect(true)
    }
  }

  const connect = (retry = false) => {
    if (retry) {
      logger.log('WS reconnecting..')
      setTimeout(connect, 1000)
      return
    }

    if (ws) {
      try {
        ws.close()
      }
      catch {
        // Do nothing
      }
      ws = undefined
    }

    // WebSocket Base URL
    const wsURL = `${(useRuntimeConfig().public.content as { wsUrl: string }).wsUrl}ws`

    logger.log(`WS connect to ${wsURL}`)

    ws = new WebSocket(wsURL)
    ws.onopen = onOpen
    ws.onmessage = onMessage
    ws.onerror = onError
    ws.onclose = onClose
  }

  // automatically connect on use
  connect()

  return {
    connect,
  }
}
