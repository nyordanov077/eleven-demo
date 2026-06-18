import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const contact = { name: "Hristo Borisov", company: "Payhawk" };

const systemPrompt = `You are a contact-enrichment engine for an early-stage VC fund focused on Central and Eastern Europe.
Given a person's name and company, use web search to find current, accurate information about them.

Return ONLY a single valid JSON object. No markdown, no code fences, no commentary before or after.

The JSON must have exactly these fields:
- name, company: as given
- title: their role (e.g. "Co-founder & CEO")
- sector: the company's sector
- stage: current funding stage if found (e.g. "Seed", "Series A", "Public") or "unknown"
- hq_location: city and country of HQ
- linkedin: full LinkedIn URL ONLY if you found a real one in search results, otherwise "not found"
- summary: one sentence on who this person is
- suggested_action: a concrete next step for the fund, grounded in the facts (fund invests pre-seed onward; a unicorn founder is a potential LP/angel/dealflow source, not a target)
- confidence: "high", "medium", or "low" — based on how much you could actually verify via search

Never invent a LinkedIn URL. Base everything on what search actually returned.`;

const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
        { role: "user", content: `Name: ${contact.name}\nCompany: ${contact.company}` }
    ],
    tools: [
        { type: "web_search_20250305", name: "web_search", max_uses: 3 }
    ],
});

// Когато Claude ползва инструмент, отговорът съдържа НЯКОЛКО блока:
// стъпките на търсенето + финалния текст. Взимаме само последния текстов блок.
const textBlocks = response.content.filter(b => b.type === "text").map(b => b.text);
let raw = textBlocks[textBlocks.length - 1].trim();
raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

try {
    const enriched = JSON.parse(raw);
    console.log(JSON.stringify(enriched, null, 2));
} catch (err) {
    console.log("Не успях да разчета JSON. Суровият отговор беше:\n", raw);
}