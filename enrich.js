import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync } from "fs";

const client = new Anthropic();

const systemPrompt = `You are a contact-enrichment engine for an early-stage VC fund focused on Central and Eastern Europe.
Given a person's name and company, use web search to find current, accurate information about them.

Return ONLY a single valid JSON object. No markdown, no code fences, no commentary before or after.

The JSON must have exactly these fields:
- name, company: as given
- title: their role
- sector: the company's sector
- stage: current funding stage if found, or "unknown"
- hq_location: city and country of HQ
- linkedin: full LinkedIn URL ONLY if found in search results, otherwise "not found"
- summary: one sentence on who this person is
- suggested_action: a concrete next step for the fund, grounded in the facts (fund invests pre-seed onward; a unicorn founder is a potential LP/angel/dealflow source, not a target)
- confidence: "high", "medium", or "low" — based on how much you could verify via search

Never invent a LinkedIn URL. Base everything on what search actually returned.`;

// --- Многократно използваемата логика: обогати ЕДИН контакт ---
async function enrichContact(contact) {
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

    const textBlocks = response.content.filter(b => b.type === "text").map(b => b.text);
    let raw = textBlocks[textBlocks.length - 1].trim();
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(raw);
}

// --- 1) ЧЕТЕМ суровината ---
const csv = readFileSync("input.csv", "utf-8").trim();
const rows = csv.split("\n").slice(1); // прескачаме заглавния ред
const contacts = rows.map(row => {
    const [name, company] = row.split(",");
    return { name: name.trim(), company: company.trim() };
});

// --- 2) ОБРАБОТВАМЕ всеки контакт един по един ---
const results = [];
for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    console.log(`Обогатявам ${i + 1}/${contacts.length}: ${contact.name}...`);
    try {
        const enriched = await enrichContact(contact);
        results.push(enriched);
    } catch (err) {
        console.log(`  ⚠️  Проблем с ${contact.name}, пропускам. (${err.message})`);
        results.push({
            name: contact.name,
            company: contact.company,
            confidence: "low",
            error: "enrichment failed"
        });
    }
}

// --- 3) ЗАПИСВАМЕ резултата ---
writeFileSync("output.json", JSON.stringify(results, null, 2));
console.log(`\nГотово! Обогатени ${results.length} контакта → output.json`);