import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Контактът, с който тестваме
const contact = { name: "Hristo Borisov", company: "Payhawk" };

// Инструкциите, които превръщат Claude в строг двигател за обогатяване
const systemPrompt = `You are a contact-enrichment engine for an early-stage VC fund focused on Central and Eastern Europe.
Given a person's name and company, return what you know about them.

Return ONLY a single valid JSON object. No markdown, no code fences, no commentary before or after.

The JSON must have exactly these fields:
- name: the person's name
- company: the company name
- title: their role (e.g. "Co-founder & CEO")
- sector: the company's sector (e.g. "Fintech")
- stage: funding stage if known (e.g. "Seed", "Series A", "Public") or "unknown"
- hq_location: city and country of the company HQ
- linkedin: full LinkedIn URL, or "not found" if you are not certain it is real
- summary: one sentence on who this person is
- suggested_action: a concrete next step for the fund, grounded in the facts above (the fund invests pre-seed onward, so a unicorn founder is a potential LP/angel/dealflow source, not an investment target)
- confidence: "high", "medium", or "low" — how sure you are about the data above

Never invent a LinkedIn URL. If unsure, write "not found".
Base suggested_action only on what you actually know. If you are guessing, lower the confidence.`;

const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 500,
    system: systemPrompt,
    messages: [
        { role: "user", content: `Name: ${contact.name}\nCompany: ${contact.company}` }
    ],
});

// Отговорът на Claude е текст — очакваме да е JSON
let raw = response.content[0].text.trim();

// Предпазна мрежа: маха кодовите кавички, ако моделът все пак ги е сложил
raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

// Превръщаме текста в истински JavaScript обект
try {
    const enriched = JSON.parse(raw);
    console.log(JSON.stringify(enriched, null, 2));
} catch (err) {
    console.log("Не успях да разчета JSON. Суровият отговор беше:\n", raw);
}