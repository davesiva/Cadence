import { Router } from 'express'

export default function chatRouter(db) {
  const router = Router()

  router.post('/', async (req, res) => {
    const { messages, systemPrompt, maxTokens = 1024 } = req.body

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: maxTokens,
          system: systemPrompt,
          messages
        })
      })

      if (!response.ok) {
        const err = await response.text()
        console.error('Anthropic API error:', response.status, err)
        return res.status(response.status).json({ error: `Anthropic API error: ${response.status}` })
      }

      const data = await response.json()
      res.json(data)
    } catch (err) {
      console.error('Chat proxy error:', err)
      res.status(502).json({ error: 'Failed to reach Anthropic API' })
    }
  })

  return router
}
