import type { Register } from 'claude-code'

const STORE_KEY = 'stamps'
const MAX_STAMPS = 20000
const BUBBLE_SHARE = 0.75
const MIN_BUBBLE = 24
const DEFAULT_COLUMNS = 100
const USER_COLOR = 'success'
const CLAUDE_COLOR = 'claude'

type Stamps = Record<string, number>
type Engine = Parameters<Parameters<Parameters<Register>[0]>[1]>[0]

let stamps: Stamps | undefined

const pad = (n: number): string => String(n).padStart(2, '0')

export const formatTime = (ms: number): string => {
  const d = new Date(ms)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${pad(d.getFullYear() % 100)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const stripStamp = (text: string): string =>
  text.replace(/^\[\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}\] /, '').replace(/^`\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}` {2}/, '')

export const bubbleWidth = (columns: number | undefined): number =>
  Math.max(MIN_BUBBLE, Math.floor((columns ?? DEFAULT_COLUMNS) * BUBBLE_SHARE))

async function remember($: Engine, id: string): Promise<number> {
  if (!stamps) {
    const held = await $.store.get(STORE_KEY)
    stamps = held && typeof held === 'object' ? { ...(held as Stamps) } : {}
  }
  const known = stamps[id]
  if (known !== undefined) return known
  const now = await $.clock.now()
  stamps[id] = now
  const ids = Object.keys(stamps)
  if (ids.length > MAX_STAMPS) {
    for (const old of ids.slice(0, ids.length - MAX_STAMPS)) delete stamps[old]
  }
  try {
    await $.store.set(STORE_KEY, stamps)
  } catch {
    // kept in memory for this session
  }
  return now
}

export const register: Register = on => {
  on('session.append', async ($, e, next) => {
    if (e.door === 'prompt' || e.door === 'response') await remember($, e.uuid)
    return next(e)
  })

  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    if (e.props.task || e.props.from || e.props.origin.kind === 'task-notification') return next(e)
    const time = formatTime(await remember($, e.requestId))
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="row" justifyContent="flex-end" marginTop={1}>
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor={USER_COLOR}
          paddingX={1}
          width={bubbleWidth(e.viewport?.columns)}
        >
          <Box flexDirection="row" justifyContent="space-between">
            <Text color={USER_COLOR} bold>Tú</Text>
            <Text dimColor>{time} ✓✓</Text>
          </Box>
          <Text>{stripStamp(e.props.text)}</Text>
        </Box>
      </Box>
    )
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (e.props.isSummary) return next(e)
    const time = e.props.isFirstOfReply ? formatTime(await remember($, e.requestId)) : ''
    const { Box, Text, Markdown } = $.ui.resolve(e)

    return (
      <Box flexDirection="row" justifyContent="flex-start" marginTop={e.props.isFirstOfReply ? 1 : 0}>
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor={CLAUDE_COLOR}
          paddingX={1}
          width={bubbleWidth(e.viewport?.columns)}
        >
          {e.props.isFirstOfReply ? (
            <Box flexDirection="row" justifyContent="space-between">
              <Text color={CLAUDE_COLOR} bold>Claude</Text>
              <Text dimColor>{time}</Text>
            </Box>
          ) : null}
          <Markdown text={stripStamp(e.props.text)} />
        </Box>
      </Box>
    )
  })
}
