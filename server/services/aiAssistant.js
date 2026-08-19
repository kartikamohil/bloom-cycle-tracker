const Anthropic = require('@anthropic-ai/sdk');

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable.');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function askBloomAI(message, userContext = {}) {
  const systemPrompt = `
You are Bloom AI, a friendly and supportive menstrual cycle tracking assistant.

Bloom is a menstrual cycle tracking application.

Your job is to:
- Help users understand patterns in their logged cycle data.
- Give general wellness and menstrual-health information.
- Help users understand symptoms they have logged.
- Encourage healthy self-care habits.
- Explain information in simple, supportive language.

Important safety rules:
- You are not a doctor.
- Do not diagnose medical conditions.
- Do not claim that a user definitely has a disease or condition.
- Do not prescribe medication or provide dangerous medical instructions.
- If a user describes severe, unusual, or concerning symptoms, recommend speaking with a qualified healthcare professional.
- Clearly distinguish between information from the user's Bloom data and general health information.
- Never invent cycle information that is not provided.

User's Bloom information:
${JSON.stringify(userContext, null, 2)}
`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: message
      }
    ]
  });

  const textBlock = response.content.find(
    block => block.type === 'text'
  );

  return textBlock
    ? textBlock.text
    : 'Sorry, I could not generate a response.';
}

module.exports = {
  askBloomAI
};