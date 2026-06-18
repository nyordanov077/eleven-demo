# VC Contact Enrichment Pipeline

> An agentic pipeline that turns a raw list of names into structured, VC-ready
> contact intelligence — powered by Claude with live web search tool use.

## The problem

Early-stage VC funds work with constant streams of people data: founders met at
events, LPs, co-investors, ecosystem contacts. It usually arrives as a bare list
— just names and companies. Turning that into something useful (roles, sectors,
funding stages, a next action) is slow, manual work.

This project automates that first pass.

## What it does

A three-stage pipeline:

1. **Read** — takes a raw `input.csv` of just `name, company`.
2. **Enrich** — for each contact, Claude searches the web and returns a
   structured profile: title, sector, funding stage, HQ, LinkedIn, a one-line
   summary, a suggested next action, and a confidence level.
3. **Validate** — an independent check confirms every record matches the schema
   before the data is trusted, so nothing broken silently enters a knowledge base.

### Example

Input:

    name,company
    Hristo Borisov,Payhawk

Output (illustrative):

    {
      "name": "Hristo Borisov",
      "company": "Payhawk",
      "title": "Co-founder & CEO",
      "sector": "Fintech",
      "stage": "Series B",
      "hq_location": "Sofia, Bulgaria",
      "linkedin": "https://www.linkedin.com/in/hristoborisov/",
      "summary": "Co-founder and CEO of Payhawk, a Sofia-based spend-management fintech and one of the region's first unicorns.",
      "suggested_action": "Outside the pre-seed thesis — engage as a potential LP, angel, or dealflow source rather than an investment target.",
      "confidence": "high"
    }

## How it works (design notes)

- **Agentic tool use.** Claude is given the web search tool and decides on its
  own when and what to search, reads the results, and stops when confident — all
  in a single API call. The enrichment is grounded in real, current data, not
  the model's memory.
- **Structured output.** The model is constrained to return a single JSON object
  matching a fixed schema, so the output is machine-usable downstream (e.g. a CRM
  import) rather than free text.
- **Anti-hallucination by design.** LinkedIn URLs are only returned if actually
  found in search results, otherwise `"not found"`. A `confidence` field reflects
  how much could be verified. The system is built to say "I don't know" instead
  of guessing.
- **Resilient pipeline.** Each contact is processed independently with its own
  error handling — one failure never stops the run.
- **Separation of concerns.** Enrichment (`enrich.js`) and validation
  (`validate.js`) are separate, single-purpose programs.

## Run it

    npm install

Create a `.env` file with your Anthropic API key:

    ANTHROPIC_API_KEY=your-key-here

Then:

    node --env-file=.env enrich.js   # reads input.csv → writes output.json
    node validate.js                 # checks output.json against the schema

## Tech stack

Node.js · `@anthropic-ai/sdk` · Claude Sonnet 4.6 with the web search tool

## Possible extensions

- Push enriched records straight into a CRM (HubSpot, Affinity, Attio).
- Relationship mapping: detect shared investors or overlapping networks.
- Dedup and refresh logic to keep an existing knowledge base current.

---

Built by [nyordanov077](https://github.com/nyordanov077) as a demo for the AI & Claude Engineer role at Eleven.