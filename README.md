# PostedIn

**PostedIn** is a **LinkedIn-style writing assistant**. You drop rough notes into a **Prompt**, optionally add a **writing sample** so the tone matches yours, then hit **generate**. The draft **streams** into a feed-style **preview**, so you watch it take shape the way it would on LinkedIn instead of reading a wall of chat text.

You can refine in plain English, **jump back to older drafts** when something goes sideways, and use shortcuts like **Improve hook** or **Sound more like me** (after you add a sample). **Dictation** works in the Prompt and Refine fields anywhere your browser supports the mic.

You bring your **own OpenAI API key**. Nothing hits a database: refinement history stays in the **browser for that session only**.

**Demo:** This repo does not include a throwaway hosted demo. **[See PostedIn in context on LinkedIn](https://www.linkedin.com/)** and swap that link for your own showcase post when you ship one.

## Contents

| | |
|--|--|
| [1. Introduction](#1-introduction) | Logo / product mark |
| [2. Project overview](#2-project-overview) | Full workspace in one frame |
| [3. Compose workspace](#3-compose-workspace) | Prompt, mic, Input column |
| [4. Output preview and actions](#4-output-preview-and-actions) | Feed-style streaming card |
| [5. Refinement and draft history](#5-refinement-and-draft-history) | Refine thread |
| [6. Responsive layout and accessibility](#6-responsive-layout-and-accessibility) | Narrow viewport stack |
| [7. Features, model, and stack](#7-features-model-and-stack) | Output toolbar (actions in UI) |
| [8. How to run and license](#8-how-to-run-and-license) | Draft history / session workflow |

---

## 1. Introduction

If you want LinkedIn-ready text without living inside a chat app, this is basically: **compose**, **preview** like a real post, then **nudge** the copy until it feels right.

<p align="center">
  <img width="900" alt="PostedIn logo mark" src="public/postedin-preview.png">
  <br>
  <b>Figure 1: Product mark for the repo and docs.</b>
</p>

---

## 2. Project overview

The layout is a **compose rail** on one side (Prompt, optional sample, tabs) and a **LinkedIn-style preview** on the other. The flow is simple: **idea → draft → tweak**.

**Writing**

- **Prompt:** Paste bullets or paragraphs. This is the raw material for the first generation.
- **Writing sample (optional):** Paste old posts or emails so structure, line breaks, and voice line up. The same sample powers **Sound more like me** once a draft exists.

**Tabs and generation**

- **Input / Refine tabs:** **Input** holds the big text fields. **Refine** is a separate thread so you are not scrolling one endless column.
- **Streaming:** The preview **updates live** while the model writes. You are not waiting on a single blob of text at the end.
- **Refine with context:** Each request sends the current draft plus **refinement history** so edits stay consistent. **Restore** older versions from **Draft history** chips or from a refine bubble when a newer version exists.

**Preview and polish**

- **Output card:** Edit in place in the preview. Under the card: **Copy**, **Regenerate**, **Improve hook**, and **Sound more like me** (when a sample is set).
- **Voice (Prompt and Refine only):** The mic uses the **Web Speech API** (Chromium tends to behave best). It appends transcribed text. It does **not** apply to the writing sample field.
- **Cleanup:** After generation, the server normalizes punctuation (for example straight quotes instead of curly ones, and it strips **em dash** characters) so paste-out is less messy.

<p align="center">
  <img width="900" alt="PostedIn full workspace overview" src="public/postedin-overview.png">
  <br>
  <b>Figure 2: Nav, compose rail, and preview in one frame.</b>
</p>

---

## 3. Compose workspace

Use **Input** for the **Prompt** and **Your writing sample**. **Refine** sits on the other tab in the same rail. Before you have a draft, most of the work happens here: type, paste, or **dictate** into Prompt (the mic works in **Refine** too). A solid sample here pays off later for voice matching.

<p align="center">
  <img width="500" alt="PostedIn Prompt field with voice dictation" src="public/postedin-prompt-voice.png">
  <br>
  <b>Figure 3: Prompt with mic. You can include the sample field in the same capture if it reads better.</b>
</p>

---

## 4. Output preview and actions

The post **streams** into a **feed-style card** so it reads like LinkedIn, not a chat bubble. Under the card you will see **Copy**, **Regenerate**, **Improve hook**, and **Sound more like me** when a sample is present. **Section 7** shows that toolbar in isolation.

<p align="center">
  <img width="500" alt="PostedIn output preview card" src="public/postedin-output.png">
  <br>
  <b>Figure 4: Where the draft lands and streams in.</b>
</p>

---

## 5. Refinement and draft history

**Refine** is where you ask for small, specific edits (“shorter,” “stronger CTA,” that kind of thing) without polluting the original Prompt. **Draft history** chips and **Restore this version** on bubbles help when a refine goes too far. **Section 8** shows the history UI.

<p align="center">
  <img width="500" alt="PostedIn Refine tab and thread" src="public/postedin-refine.png">
  <br>
  <b>Figure 5: Refine thread for iterative edits.</b>
</p>

---

## 6. Responsive layout and accessibility

Wide screens: **Compose** and **Output** sit side by side. Narrow screens: the same flow **stacks** so nothing feels bolted on for mobile. Compose uses proper tab panels, important controls have `aria` labels, and **Ctrl/Cmd+Enter** sends a refine where that shortcut applies.

<p align="center">
  <img width="380" alt="PostedIn stacked layout on a narrow viewport" src="public/postedin-mobile.png">
  <br>
  <b>Figure 6: Stacked compose and preview on a small viewport.</b>
</p>

---

## 7. Features, model, and stack

### What the app does (implementation)

- **Next.js App Router:** `/api/generate` streams completions as **plain text** (`text/plain`) for a simple client.
- **OpenAI Chat Completions** (`gpt-4o-mini`): Fixed **system prompt** aimed at LinkedIn-shaped posts (hook, body, takeaway; length guidance is in the low thousands of characters in instructions).
- **Server actions:** `generate`, `regenerate`, `refine`, `improve_hook`, `sound_like_me`. Payloads are validated and size-capped for self-hosted use.
- **Draft checkpoints (client):** After each successful AI update, a **checkpoint** stores post text and matching `refineTurns`. Restoring rolls back newer history so API calls stay consistent.
- **`sanitizePostOutput`:** Lives in `lib/sanitizePost.ts`. Runs after streams finish to normalize dashes and typographic quotes.
- **Layout:** Two columns on large screens, stack on small. Nav, borders, and type lean LinkedIn-adjacent via Tailwind tokens.

### Model behavior

There is no “edit system prompt” screen. Behavior lives in code (`lib/openai.ts`). Roughly:

- Bias toward **human**, **non-buzzy** LinkedIn copy. Instructions avoid em dash characters, and post-processing still cleans punctuation.
- **Refine** should change **only** what you asked for unless you clearly want a bigger rewrite.
- **Improve hook** touches **opening lines only**. **Sound more like me** rewrites the **full** post using your **writing sample** as the reference.

### Tech list

| Piece | Role |
|--------|------|
| **Next.js 16** | App Router, RSC where it fits, streaming API route |
| **React 19** | Compose state, refine thread, checkpoints, stream handling |
| **TypeScript 5** | API payloads, checkpoint types, OpenAI params |
| **Tailwind CSS 4** | Layout, palette, components |
| **OpenAI Node SDK** | Chat completions from the server only |
| **Web Speech API** | Optional dictation (`components/VoiceDictateButton.tsx`) |

<p align="center">
  <img width="500" alt="PostedIn output actions Copy Regenerate Improve hook Sound more like me" src="public/postedin-output-actions.png">
  <br>
  <b>Figure 7: Output toolbar aligned with the server actions above.</b>
</p>

---

## 8. How to run and license

**1. Clone and install**

```bash
git clone https://github.com/KhalidHossainGitHub/PostedIn.git
cd PostedIn
npm install
```

**2. Environment**

```bash
cp .env.example .env.local
```

Open `.env.local` and add your [OpenAI API key](https://platform.openai.com/api-keys):

```
OPENAI_API_KEY=your_openai_api_key_here
```

Do **not** commit `.env.local` (it is gitignored). Everyone uses their own key.

**3. Dev server**

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

**4. Typical flow**

- Fill **Prompt** (and **Your writing sample** if you want), then **Generate Post**.
- Open **Refine** for edits. Use **Draft history** or **Restore this version** on a bubble to undo.
- When it looks good, **Copy**. Otherwise try **Regenerate**, **Improve hook**, or **Sound more like me** from the output toolbar.

<p align="center">
  <img width="500" alt="PostedIn Draft history chips and restore" src="public/postedin-draft-history.png">
  <br>
  <b>Figure 8: Draft history and restore. Session-only, browser storage, no database.</b>
</p>

**License:** MIT
