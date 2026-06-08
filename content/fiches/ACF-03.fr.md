---
code: "ACF-03"
slug: "constitution-agentique"
title: "Constitution Agentique"
title_en: "Agentic Constitution"
order: 3
maturity_dimension: "D2"
related_principles: ["P1", "P3"]
related_articles:
  - { regulation: "ai-act", article: "9", paragraph: "1" }
  - { regulation: "gdpr", article: "25" }
related_fiches: ["ACF-04", "ACF-12"]
keywords: ["mandat", "périmètre", "agent", "constitution", "doctrine"]
version: "1.0"
pdf_url: "/toolkit/ACF-03_constitution-agentique.pdf"
---

# Constitution Agentique

## Objet de la fiche

Définir le document fondateur d'un agent IA autonome — sa "constitution" — qui pose le périmètre, les principes opératoires, les limites et les engagements de gouvernance avant tout déploiement.

## Méthodologie

### 1. Identification

- Nom de l'agent.
- Version de la doctrine ACF® appliquée.
- Niveau d'autonomie cible (N0 → N3).
- DDAO nommé.

### 2. Périmètre de décision

- Décisions autorisées (liste positive et limitative).
- Décisions interdites (liste négative explicite).
- Frontières d'invocation (qui peut activer l'agent, depuis quels canaux).

### 3. Engagements de gouvernance

- Respect du mandat opérationnel (cf. ACF-12).
- Respect des seuils d'escalade (cf. ACF-09).
- Respect du kill switch (cf. ACF-07).
- Tenue du registre des décisions (cf. ACF-05).

### 4. Doctrine de référence

- Citation de la version ACF® appliquée (`doctrine_version`, `doctrine_hash`, `doctrine_archive_url`).
- Mention des principes activés (P1-P4).
- Mention des fiches mobilisées.

### 5. Validation

- Sign-off DDAO obligatoire.
- Sign-off des fonctions concernées (DPO si données personnelles, RSSI si surface d'attaque, Legal si exposition juridique).
- Date de revue programmée.

## Exemple « Lendari »

Lendari déploie un agent de réordonnancement de stock dans 7 boutiques. La constitution agentique précise :
- N2, périmètre de réordonnancement borné par la fourchette de prix et de quantité.
- DDAO = Directrice supply chain.
- Décisions autorisées : passer commande dans la fourchette ; alerter sur rupture imminente.
- Décisions interdites : modifier le panel fournisseurs ; négocier des conditions ; engager des paiements.
- Kill switch : suspension immédiate par la DDAO ou par le COMEX.
- Mandat : refresh trimestriel, revue annuelle.

## Liens vers d'autres fiches

- ACF-04 (Fiche Agent)
- ACF-12 (Mandat d'Agent)
- ACF-07 (Kill switch)

## Erreurs fréquentes

- Constitution vague qui n'énumère pas les décisions interdites → l'agent dérive dès que le cas n'est pas explicitement couvert.
- DDAO nommé en titre, pas en pratique → personne ne porte la décision.
- Pas de version de doctrine citée → impossible de tracer ex post.
