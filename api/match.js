// api/match.js (Vercel) or netlify/functions/match.js (Netlify)
import { caseStudies } from '../caseStudies.js';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { need } = req.body;

  const systemPrompt = `
You are a helpful assistant for a marketing agency.
Your job is to read a potential client's marketing need and recommend the 2-3 most relevant case studies from the list below.

Return ONLY a JSON array. No explanation, no markdown. Example format:
[{ "title": "...", "url": "...", "reason": "One sentence why this is relevant" }]

CASE STUDIES:
${JSON.stringify(caseStudies, null, 2)}
  `;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: 'user', content: need }]
  });

  const raw = message.content[0].text;
  const matches = JSON.parse(raw);

  res.status(200).json({ matches });
}