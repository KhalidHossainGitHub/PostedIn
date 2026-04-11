# PostedIn - Design System

## Aesthetic

The UI is a **pixel-accurate recreation of LinkedIn's visual language**, not just "LinkedIn-inspired." Every element mirrors how LinkedIn actually looks so the right-side preview feels like you're looking at your real feed.

## Color Palette

| Token              | Hex       | Usage                                      |
|--------------------|-----------|---------------------------------------------|
| Page background    | `#f4f2ee` | LinkedIn's signature warm gray              |
| Card background    | `#ffffff` | Post cards, nav bar, input panel            |
| Card border        | `#e0dfdc` | Subtle warm border on cards                 |
| Primary text       | `#191919` | Headings, names, post body                  |
| Secondary text     | `#666666` | Subtitles, timestamps, metadata             |
| Muted text         | `#00000099` | Helper text, "... more" link              |
| Link / Accent blue | `#0a66c2` | Buttons, Follow, LinkedIn logo blue         |
| Link hover         | `#004182` | Darker blue on hover states                 |
| Reaction bar text  | `#666666` | Like / Comment / Repost / Send labels       |
| Reaction hover bg  | `#e0dfdc` | Hover state on reaction buttons             |
| Divider            | `#e0dfdc` | Thin separators between sections            |
| Input focus ring   | `#0a66c2` | Blue ring on focused inputs                 |

## Typography

- **Font**: `-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto` (LinkedIn's actual font stack)
- **Post name**: 14px, font-weight 600, `#191919`
- **Post subtitle**: 12px, font-weight 400, `#666666`
- **Post body**: 14px, font-weight 400, `#191919`, line-height 1.43
- **Reaction labels**: 12px, font-weight 600, `#666666`
- **Nav items**: 12px, font-weight 400, `#666666` (active: `#191919`)

## Layout

Two-panel side-by-side layout on desktop:

```
[  Left Panel (input/options)  ] [  Right Panel (LinkedIn feed preview)  ]
```

- Left: white card with prompt, writing sample, and generate action
- Right: exact replica of a LinkedIn feed post card showing the generated output
- Stacks vertically on mobile (left on top, preview below)
- Max width: ~1128px (LinkedIn's actual content width)

## LinkedIn Post Card Anatomy

```
┌─────────────────────────────────────────┐
│  [avatar]  Name                  [•••]  │
│            Title/Headline               │
│            Time • 🌐                     │
│                                         │
│  Post body text here...                 │
│  ...more                                │
│                                         │
│  ─────────────────────────────────────  │
│  👍 Like  💬 Comment  🔁 Repost  ➡ Send │
└─────────────────────────────────────────┘
```

- 48px circular avatar
- Name in bold, subtitle in gray, time + globe icon
- Body text with LinkedIn's exact spacing
- Thin divider above reaction bar
- Four reaction buttons evenly spaced

## Spacing & Radius

- Card padding: 12px horizontal, 12px top, 8px bottom
- Card border-radius: 8px
- Card border: 1px solid `#e0dfdc`
- Card shadow: none (LinkedIn uses flat borders, not shadows)
- Gap between cards: 8px (LinkedIn's feed gap)
- Input border-radius: 4px (LinkedIn uses very subtle rounding on form fields)

## Interactive States

- Buttons: subtle background change on hover
- Input focus: 1px `#0a66c2` border + faint blue ring
- Generate button: solid `#0a66c2` bg, white text, hover `#004182`
- Copy toast: green check appears inline for 2s
