import type { On } from 'claude-code'
import { expect, test } from 'claude-code/testing'

import { bubbleWidth, formatTime, stripStamp } from './register'

test('formats a short date and short time', () => {
  expect(formatTime(new Date(2026, 9, 5, 9, 7).getTime())).toBe('05/10/26 09:07')
})

test('strips the chat-timestamps prefixes', () => {
  expect(stripStamp('[16/10/26 10:01] hola')).toBe('hola')
  expect(stripStamp('`16/10/26 10:01`  hola')).toBe('hola')
  expect(stripStamp('hola')).toBe('hola')
})

test('sizes a bubble to three quarters of the width', () => {
  expect(bubbleWidth(120)).toBe(90)
  expect(bubbleWidth(20)).toBe(24)
  expect(bubbleWidth(undefined)).toBe(75)
})

const bottoms = (on: On): void => {
  on('store.get', () => ({ value: {} }))
  on('store.set', () => ({ value: undefined }))
  on('clock.now', () => ({ value: new Date(2026, 9, 16, 10, 5).getTime() }))
}

const SURFACES = ['terminal', 'desktop'] as const
const VIEWPORT = { columns: 100, rows: 40 }

for (const surface of SURFACES) {
  test(`draws a user bubble on ${surface}`, async ($, on) => {
    bottoms(on)
    const ui = await $.ui.mount({
      plugin: 'chat-bubbles',
      surface,
      component: 'UserMessage',
      props: { text: 'hola', origin: { kind: 'composer' }, isExpanded: true },
      viewport: VIEWPORT,
    } as never)
    expect(await ui.drawn()).toMatchObject({ type: 'Box' })
  })

  test(`draws a user bubble for a collapsed prompt row on ${surface}`, async ($, on) => {
    bottoms(on)
    const ui = await $.ui.mount({
      plugin: 'chat-bubbles',
      surface,
      component: 'UserMessage',
      props: { text: 'hola', origin: { kind: 'unclassified' }, isExpanded: false },
      viewport: VIEWPORT,
    } as never)
    expect(await ui.drawn()).toMatchObject({ type: 'Box' })
  })

  test(`draws a Claude bubble on ${surface}`, async ($, on) => {
    bottoms(on)
    const ui = await $.ui.mount({
      plugin: 'chat-bubbles',
      surface,
      component: 'AssistantMessage',
      props: { text: '**hola**', isFirstOfReply: true },
      viewport: VIEWPORT,
    })
    expect(await ui.drawn()).toMatchObject({ type: 'Box' })
  })
}
