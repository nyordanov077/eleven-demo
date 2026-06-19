# VC Contact Enrichment — Make.com Automation

> A no-code Make.com scenario that enriches new CRM rows automatically: when a
> contact is added to a Google Sheet, it is scored and profiled for VC relevance,
> then written back — with no manual work.

This is a second take on the same problem solved by the code pipeline in the
parent repo. Where that version is code-based with live web search, this one is a
no-code automation built on Make.com — demonstrating the same VC enrichment logic
across a different toolset and model provider (OpenAI).

## Trigger

The scenario watches a Google Sheet acting as a lightweight CRM. It can be manually triggered, or it can watch for new rows.

## Flow

1. **Google Sheets — Watch New Rows.** Watches for the row we want to process.
2. **HTTP — POST to the LLM.** Sends the contact (name, company, notes) to an
   OpenAI chat completion with a system prompt defining the VC enrichment task.
3. **JSON — Parse.** Two parsing steps turn the model's response into structured fields.
4. **Google Sheets — Update a Row.** Writes the enriched fields back to the same
   row and flips `status` to `processed`.

## Output fields written back

- `role` — the contact's role (CEO, Founder, CTO, LP, ...)
- `sector` — the company's sector
- `company_summary` — a short description of the company
- `vc_relevance_score` — 0–100, how relevant this contact is to an early-stage CEE fund
- `reason_for_score` — why that score was given
- `suggested_next_action` — a concrete next step for the fund
- `confidence_percentage` — how confident the model is in its assessment
- `status` — flipped from `new` to `processed`

## Why the relevance score matters

The scenario doesn't just describe a contact — it judges fit. A mega-cap founder
(e.g. SpaceX) correctly scores low, because a pre-seed/seed CEE fund would not
invest there. The system surfaces who is worth the fund's attention, not just who exists.

## Honest limitations / next steps

- This version relies on the model's training knowledge, not live web search, so
  enrichment is weaker for less well-known contacts. Adding a search step before
  the LLM call is the natural next extension.
- The scoring rubric lives in the prompt; a production version would externalise
  it so it can be tuned without editing the scenario.

## Files

- `blueprint.json` — the exportable Make.com scenario (API key redacted).
- `screenshots/` — the scenario flow and example enriched output.

## Note on secrets

The OpenAI API key is redacted from `blueprint.json`. To run this, import the
blueprint into Make.com and add your own key to the HTTP module's Authorization header.