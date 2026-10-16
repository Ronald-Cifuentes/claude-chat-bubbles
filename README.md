# chat-bubbles

A Claude Code mod that draws the transcript like a messaging-app chat:

```
                          ╭──────────────────────────────╮
                          │ Tú           16/10/26 10:05 ✓✓│
                          │ hola, ¿cómo vas?             │
                          ╰──────────────────────────────╯
╭──────────────────────────────╮
│ Claude        16/10/26 10:05 │
│ Bien. ¿Qué hacemos?          │
╰──────────────────────────────╯
```

- Your messages: a green bubble on the right, with the time and ✓✓ beside your name.
- Claude's replies: a bubble in Claude's color on the left, the time beside the name, markdown kept.
- Each bubble takes three quarters of the terminal width and follows a resize.
- Colors come from your Claude Code theme, so light and dark themes both work.
- Tool calls, notifications and messages from other agents draw as usual.
- Works beside the `chat-timestamps` mod: its time prefix is moved into the bubble.

## Install

At the prompt of a terminal session:

```
/plugin install chat-bubbles --marketplace Ronald-Cifuentes/claude-chat-bubbles
```

Answer `y` to add the marketplace, then pick a scope (user scope loads it in every session).

From a shell:

```
claude plugin install chat-bubbles --marketplace Ronald-Cifuentes/claude-chat-bubbles
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `Ronald-Cifuentes/claude-chat-bubbles`, then Add plugin.
