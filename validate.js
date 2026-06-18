import { readFileSync } from "fs";

// Договорът: точно тези десет полета трябва да присъстват
const REQUIRED_FIELDS = [
    "name", "company", "title", "sector", "stage",
    "hq_location", "linkedin", "summary", "suggested_action", "confidence"
];
const VALID_CONFIDENCE = ["high", "medium", "low"];

const data = JSON.parse(readFileSync("output.json", "utf-8"));

let validCount = 0;
const problems = [];

data.forEach((record) => {
    const issues = [];

    // 1) всички полета присъстват и не са празни
    for (const field of REQUIRED_FIELDS) {
        if (!record[field] || String(record[field]).trim() === "") {
            issues.push(`липсва или празно поле: ${field}`);
        }
    }

    // 2) confidence е една от позволените стойности
    if (record.confidence && !VALID_CONFIDENCE.includes(record.confidence)) {
        issues.push(`невалиден confidence: "${record.confidence}"`);
    }

    // 3) linkedin е или "not found", или истински линк
    if (record.linkedin && record.linkedin !== "not found" && !record.linkedin.startsWith("http")) {
        issues.push(`подозрителен linkedin: "${record.linkedin}"`);
    }

    if (issues.length === 0) {
        console.log(`✓  ${record.name} — наред`);
        validCount++;
    } else {
        console.log(`✗  ${record.name || "(без име)"} — ${issues.length} проблем(а):`);
        issues.forEach(issue => console.log(`     • ${issue}`));
        problems.push(record.name || "(без име)");
    }
});

console.log(`\nОбобщение: ${validCount}/${data.length} записа спазват схемата.`);
if (problems.length > 0) {
    console.log(`Проблемни: ${problems.join(", ")}`);
}