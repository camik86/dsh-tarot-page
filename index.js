/**
 * Host half of @local/dsh-tarot.
 *
 * Deliberately narrow: this plugin adds ONE tarot page to the Web GUI and the
 * model-facing surface stays untouched. It registers no tool, no skill, no
 * slash command and no system-prompt section — only three same-origin HTTP
 * routes used by its own page:
 *
 *   GET  /plugins/dsh-tarot/api/models     provider/model catalog + default
 *   POST /plugins/dsh-tarot/api/interpret  streamed tarot reading (SSE)
 *   POST /plugins/dsh-tarot/api/chat       streamed follow-up inside the page
 *
 * The model call goes through the profile's own `ctx.llm` adapter registry, so
 * it uses whatever provider/model the user configured in DSH.
 */

export const inject = ['webServer', 'llm']

const { readFile } = await import('node:fs/promises')

const API = '/plugins/dsh-tarot-page/api'
const ASSETS = '/plugins/dsh-tarot-page/assets'
const MAX_BODY_BYTES = 1_000_000

const SYSTEM_PROMPT = [
  '你是一位冷静、诚实、有经验的塔罗解读师。',
  '规则：',
  '1. 只依据用户给出的牌阵、每张牌的位置与正/逆位牌义进行解读；不要自创牌义，不要把牌义反过来讲。',
  '2. 不做命运断言：不预测生死、疾病诊断、投资涨跌、法律结果；不制造恐惧。塔罗用于自我反思，不是预言。',
  '3. 先陈述牌面事实（哪张牌、正逆位、在什么位置），再做串联与建议。',
  '4. 语气温和、具体、可执行；避免空话套话。',
  '输出使用简体中文 Markdown，结构：',
  '## 整体主题',
  '## 逐牌解读（按位置顺序）',
  '## 牌与牌之间的关联',
  '## 可执行的建议',
  '## 一句提醒（塔罗是反思工具，不是命运判决）',
].join('\n')

function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('request body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8')
        resolve(text.length > 0 ? JSON.parse(text) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function startSse(res) {
  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
    'x-accel-buffering': 'no',
  })
  res.flushHeaders?.()
}

function sse(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`)
}

function cardLine(card) {
  const pos = card.position ? `位置「${card.position}」：` : ''
  const orientation = card.orientation === 'rev' ? '逆位' : '正位'
  const meaning = card.orientation === 'rev' ? card.rev : card.up
  const keywords = Array.isArray(card.kw) && card.kw.length > 0 ? `关键词：${card.kw.join('、')}。` : ''
  return `- ${pos}${card.zh}（${card.en}）${orientation}。${keywords}牌义：${meaning}`
}

function buildUserPrompt(body) {
  const spread = body.spread ?? {}
  const cards = Array.isArray(body.cards) ? body.cards : []
  const positions = Array.isArray(spread.positions) ? spread.positions : []
  const lines = []
  lines.push(`我的问题：${body.question || '（未填写，请按牌阵给出整体解读，并在开头先请我补充问题）'}`)
  lines.push(`牌阵：${spread.zh || spread.id || '未知'}（${cards.length} 张）`)
  if (positions.length > 0) lines.push(`位置定义：${positions.join(' / ')}`)
  lines.push('抽到的牌：')
  for (const card of cards) lines.push(cardLine(card))
  lines.push('请按系统提示的结构解读：先牌面事实，再串联，最后给可执行建议。')
  return lines.join('\n')
}

function buildMessages(body) {
  const history = Array.isArray(body.history) ? body.history.slice(-8) : []
  const messages = []
  messages.push({ role: 'user', content: [{ type: 'text', text: buildUserPrompt(body) }] })
  if (body.reading) {
    messages.push({ role: 'assistant', content: [{ type: 'text', text: String(body.reading) }] })
  }
  for (const turn of history) {
    if (turn && typeof turn.text === 'string' && turn.text.length > 0) {
      messages.push({ role: turn.role === 'assistant' ? 'assistant' : 'user', content: [{ type: 'text', text: turn.text.slice(0, 4000) }] })
    }
  }
  if (body.message) {
    messages.push({ role: 'user', content: [{ type: 'text', text: String(body.message).slice(0, 4000) }] })
  }
  return messages
}

export function apply(ctx) {
  const web = ctx.webServer
  const llm = ctx.llm

  function currentDefaultSelection() {
    try {
      const service = ctx.get('agentDefaultModel')
      const selection = service?.currentSelection?.()
      if (selection && typeof selection === 'object' && selection.provider) {
        return { provider: String(selection.provider), model: String(selection.model ?? '') }
      }
    } catch {
      // optional service: absence is fine
    }
    return undefined
  }

  async function handleModels(req, res) {
    if (req.method !== 'GET') return sendJson(res, 405, { error: 'method not allowed' })
    try {
      const providers = await llm.listProviders()
      const catalog = []
      for (const provider of providers) {
        let models = []
        try {
          models = await llm.listModels(provider.id)
        } catch {
          models = []
        }
        catalog.push({
          id: provider.id,
          name: provider.name ?? provider.id,
          models: models.map((model) => ({ id: model.id, name: model.name ?? model.id })),
        })
      }
      sendJson(res, 200, { default: currentDefaultSelection(), providers: catalog })
    } catch (error) {
      sendJson(res, 500, { error: String(error?.message ?? error) })
    }
  }

  async function handleStreaming(req, res, mode) {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' })
    let body
    try {
      body = await readBody(req)
    } catch (error) {
      return sendJson(res, 400, { error: `bad request: ${String(error?.message ?? error)}` })
    }
    const provider = typeof body.provider === 'string' ? body.provider : ''
    const model = typeof body.model === 'string' ? body.model : ''
    if (!provider || !model) {
      return sendJson(res, 400, { error: 'missing provider/model: pick a model in the tarot page settings' })
    }
    const controller = new AbortController()
    res.on('close', () => controller.abort())
    const messages = buildMessages(body)
    let started = false
    try {
      startSse(res)
      started = true
      const stream = llm.stream({
        provider,
        model,
        system: SYSTEM_PROMPT,
        messages,
        temperature: 0.75,
        maxTokens: mode === 'chat' ? 900 : 1600,
        signal: controller.signal,
        purpose: 'tarot-reading',
      })
      let text = ''
      for await (const chunk of stream) {
        if (controller.signal.aborted) break
        if (chunk.type === 'text-delta') {
          text += chunk.text
          sse(res, { t: chunk.text })
        } else if (chunk.type === 'finish') {
          if (chunk.reason?.kind === 'error') {
            sse(res, { error: String(chunk.reason.failure?.message ?? 'model error') })
          } else if (chunk.reason?.kind === 'aborted') {
            sse(res, { error: 'aborted' })
          }
        }
      }
      sse(res, { done: true, chars: text.length })
    } catch (error) {
      if (!started) return sendJson(res, 500, { error: String(error?.message ?? error) })
      try {
        sse(res, { error: String(error?.message ?? error) })
      } catch {
        // response already gone
      }
    } finally {
      try {
        res.end()
      } catch {
        // ignore double end
      }
    }
  }

  ctx.effect(
    () => web.register({ kind: 'exact', path: `${API}/models`, handler: handleModels }),
    'dsh-tarot: model catalog route',
  )
  ctx.effect(
    () => web.register({
      kind: 'prefix',
      path: ASSETS,
      resource: async (request) => {
        const url = new URL(request.url)
        const rest = decodeURIComponent(url.pathname.slice(ASSETS.length + 1))
        if (!/^cards\/[a-z0-9-]+\.webp$/.test(rest)) return new Response('not found', { status: 404 })
        try {
          const bytes = await readFile(new URL(`./assets/${rest}`, import.meta.url))
          return new Response(bytes, {
            headers: { 'content-type': 'image/webp', 'cache-control': 'public, max-age=31536000, immutable' },
          })
        } catch {
          return new Response('not found', { status: 404 })
        }
      },
    }),
    'dsh-tarot: card artwork route',
  )
  ctx.effect(
    () => web.register({ kind: 'exact', path: `${API}/interpret`, handler: (req, res) => handleStreaming(req, res, 'interpret') }),
    'dsh-tarot: reading route',
  )
  ctx.effect(
    () => web.register({ kind: 'exact', path: `${API}/chat`, handler: (req, res) => handleStreaming(req, res, 'chat') }),
    'dsh-tarot: follow-up route',
  )
}
