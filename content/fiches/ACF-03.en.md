---
code: "ACF-03"
slug: "agentic-constitution"
title: "Agentic Constitution"
title_en: "Agentic Constitution"
order: 3
maturity_dimension: "D2"
related_principles: ["P1", "P3"]
related_articles:
  - { regulation: "ai-act", article: "9", paragraph: "1" }
  - { regulation: "gdpr", article: "25" }
related_fiches: ["ACF-04", "ACF-12"]
keywords: ["mandate", "perimeter", "agent", "constitution", "doctrine"]
version: "1.0"
pdf_url: "/toolkit/ACF-03_constitution-agentique.pdf"
---

# Agentic Constitution

## Purpose of this card

Define the founding document of an autonomous AI agent — its "constitution" — that sets the perimeter, operating principles, limits and governance commitments before any deployment.

## Methodology

### 1. Identification

- Agent name.
- ACF® doctrine version applied.
- Target autonomy level (N0 → N3).
- Appointed DDAO.

### 2. Decision perimeter

- Allowed decisions (positive, limitative list).
- Forbidden decisions (explicit negative list).
- Invocation boundaries (who can activate, from which channels).

### 3. Governance commitments

- Adherence to operational mandate (cf. ACF-12).
- Adherence to escalation thresholds (cf. ACF-09).
- Adherence to the kill switch (cf. ACF-07).
- Maintenance of the decision register (cf. ACF-05).

### 4. Reference doctrine

- Citation of the ACF® version applied (`doctrine_version`, `doctrine_hash`, `doctrine_archive_url`).
- Activated principles named (P1-P4).
- Mobilised cards named.

### 5. Validation

- DDAO sign-off mandatory.
- Sign-off from concerned functions (DPO if personal data, CISO if attack surface, Legal if legal exposure).
- Scheduled review date.

## "Lendari" example

Lendari deploys a stock-replenishment agent across 7 stores. The agentic constitution specifies:
- N2, replenishment perimeter bounded by price and quantity windows.
- DDAO = Supply Chain Director.
- Allowed: place orders within window; alert on imminent stockout.
- Forbidden: modify supplier panel; negotiate terms; commit payments.
- Kill switch: immediate suspension by DDAO or by the executive committee.
- Mandate: quarterly refresh, annual review.

## Links to other cards

- ACF-04 (Agent Card)
- ACF-12 (Agent Mandate)
- ACF-07 (Kill switch)

## Frequent mistakes

- Vague constitution that does not enumerate forbidden decisions → the agent drifts as soon as a case is not explicitly covered.
- DDAO appointed in title, not in practice → no one carries the decision.
- No doctrine version cited → impossible to trace after the fact.
