import { get } from 'svelte/store'
import { getAccounts, refreshAccounts } from './accountActions'
import { getLocalHeight, getTowerChainView, maybeEmitBacklog } from './miner_invoke'
import { getMetadata } from './networks'
import { isInit } from './accounts'
import { Level, logger } from './carpeError'

let tick_in_progress = false

export const carpeTick = async () => {
  // you should always try to refresh accounts, even on error
  getAccounts()

  // This will check for a network connection
  // If successful this will set the `network.connected` bool to true. And wallet will display a view.
  // will also refresh peer stats looking to find good peers.
  // Ensure tick doesn't proceed if already in progress or initialization is not complete
  if (!tick_in_progress && get(isInit)) {
    tick_in_progress = true
    logger(Level.Info, 'carpeTick initiated because isInit is true')

    try {
      await getMetadata()
      logger(Level.Info, 'getMetadata succeeded in carpeTick')

      await refreshAccounts()
      logger(Level.Info, 'refreshAccounts succeeded in carpeTick')

      await getTowerChainView()
      logger(Level.Info, 'getTowerChainView succeeded in carpeTick')

      await getLocalHeight()
      logger(Level.Info, 'getLocalHeight succeeded in carpeTick')

      await maybeEmitBacklog()
      logger(Level.Info, 'maybeEmitBacklog succeeded in carpeTick')
    } catch (error) {
      logger(Level.Error, `carpeTick error: ${error.message}`)
    } finally {
      tick_in_progress = false
      logger(Level.Info, 'carpeTick completed')
    }
  } else if (tick_in_progress) {
    logger(Level.Warn, 'carpeTick skipped due to tick_in_progress')
  } else {
    logger(Level.Warn, 'carpeTick skipped due to isInit being false')
  }
}
