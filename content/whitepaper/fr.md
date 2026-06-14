---
title: "ACF® — Livre blanc"
doc_type: whitepaper
lang: fr
version: "2.0"
published_at: "2026-06"
author: "Vincent Dorange"
publisher: "Vincent Dorange"
classification: "Public"
canonical_url: "https://acfstandard.com/whitepaper-fr.pdf"
supersedes: "1.0 (décembre 2025)"
---

# ACF® — AGENTIC COMMERCE FRAMEWORK®
## Le standard européen de gouvernance pour les systèmes agentiques en production

**Livre blanc · Édition juin 2026 · Vincent Dorange**

*www.acfstandard.com*

---

## Sommaire

1. Résumé exécutif
2. Le défi 2026-2027 — pourquoi maintenant
3. La catégorie « gouvernance agentique » et la place d'ACF®
4. Le framework ACF® — principes, couches, niveaux, rôles
5. Les 17 fiches méthodologiques
6. La méthodologie de déploiement
7. Le protocole d'arrêt d'urgence à trois niveaux
8. ACF® face aux référentiels existants — la matrice de correspondance
9. L'écosystème ACF® — six produits opérationnels
10. Différenciateurs techniques — preuve cryptographique
11. À propos & contact
12. Mentions

---

## 1. Résumé exécutif

L'**Agentic Commerce Framework®** (ACF®) est le standard européen ouvert de gouvernance des systèmes agentiques autonomes déployés en production, dans toutes les industries et toutes les fonctions où un agent prend des décisions à conséquence (commerce, finance, services, santé, énergie, RH, marketing, opérations…). Porté par **Vincent Dorange**, il a été conçu pour répondre à un constat opérationnel précis : les référentiels existants — EU AI Act, ISO/IEC 42001, NIST AI RMF, RGPD, COBIT — disent **ce qu'il faut faire** mais ne disent pas **comment opérer une décision agentique** au quotidien. ACF® comble ce vide.

ACF® articule **4 principes fondateurs**, **4 couches opérationnelles**, **4 niveaux d'autonomie** (N0 à N3), **17 fiches méthodologiques** prêtes à l'emploi et **un rôle nommé** — le **DDAO** (Designated Delegated Agent Officer) — qui porte la responsabilité humaine de chaque agent en production. L'ensemble s'adosse à une **traçabilité cryptographique** opposable (signatures Ed25519, chaîne de hachage SHA-256, horodatage qualifié RFC 3161) qui rend chaque décision agentique auditable, indépendamment de l'infrastructure du déployeur.

Le framework ne remplace pas les standards en vigueur. Il les **opérationnalise** au niveau de la décision : à chacune des 17 fiches ACF® correspond un article de l'EU AI Act, une clause d'ISO/IEC 42001, une fonction du NIST AI RMF, un article du RGPD et un domaine de COBIT 2019. Toute équipe de conformité peut ainsi intégrer ACF® dans son audit trail existant en quelques minutes.

L'**enforcement haut-risque de l'EU AI Act entre en vigueur le 2 décembre 2027** pour les systèmes agentiques opérant dans les services essentiels (crédit, assurance, énergie, santé, justice). Les organisations qui auront déployé d'ici là des agents commerciaux sans cadre de gouvernance opérationnel se trouveront face à une obligation rétroactive de mise en conformité, sans documentation et sans piste d'audit recevable. ACF® est conçu pour qu'aucune ligne d'audit ne manque à ce moment-là.

L'écosystème ACF® articule **quatre outils gratuits** à libre accès — **ACF Score** (auto-diagnostic), **ACF AI Act Checker** (vérification de conformité AI Act en quelques minutes), **Audit Flash de conformité** (diagnostic complet en 15 minutes) et **Plan Compliance personnalisé** — et **quatre produits commerciaux** : **ACF Auditor** (audit guidé 7 dimensions), **ACF Control** (dashboard de gouvernance temps réel), **ACF Compliance** (plateforme SaaS multi-juridiction), **ACF Certification** (attestation indépendante). Un dernier vecteur — le **serveur MCP `acf-mcp`** — expose la doctrine ACF® comme ressource native aux copilotes IA (Claude, Cursor, Windsurf, Continue) avec huit outils REASON déterministes signés.

---

## 2. Le défi 2026-2027 — pourquoi maintenant

### 2.1. Les agents commerciaux ne sont plus une démonstration

En 2024-2025, le commerce agentique s'est joué dans les démonstrations. En 2026, il est entré en production. Sept protocoles concurrents ont été publiés en dix-huit mois — **MCP** (Anthropic, novembre 2024), **Operator** (OpenAI, janvier 2025), **Mariner** (Google, décembre 2024), **TAP** (Visa, octobre 2025), **Agent Pay** (Mastercard, 2025), **ACP** (Stripe + OpenAI, 2025), **TACP** (Forter, 2025). Walmart, Wells Fargo, Klarna, Expedia ou Sephora ont annoncé ou déployé des agents agissant directement sur des transactions à valeur réelle. Selon Bain & Company, un achat e-commerce sur cinq pourrait être initié par un agent autonome aux États-Unis d'ici 2028.

Pour les marchands européens, le sujet n'est plus prospectif. Il est concurrentiel et réglementaire.

### 2.2. Le risque silencieux : l'absence de cadre opérationnel

Aucun de ces protocoles ne dit qui supervise l'agent, selon quels critères, avec quelle traçabilité. Tous postulent qu'une équipe interne reconstituera cette couche au-dessus. Pour une PME, une ETI ou un groupe européen, **cette reconstitution n'est pas tenable** : elle suppose un dialogue continu entre la DSI, le DPO, le RSSI, la conformité, le métier et la direction juridique, sans grille de lecture commune et sans documentation type.

Le résultat est observable sur le terrain. Sur un échantillon de cas observés par l'auteur fin 2025-début 2026 — sous couverture de confidentialité, les organisations concernées ne pouvant être nommées —, sur dix entreprises qui exploitent un agent en production :

- **8 sur 10** n'ont pas de personne nommément responsable des décisions de l'agent ;
- **9 sur 10** ne disposent pas d'un journal cryptographiquement signé des décisions agentiques ;
- **10 sur 10** ne peuvent pas produire, à la demande d'un auditeur, la trace complète d'une décision précise prise par l'agent un mardi à 14 h 12.

Ces trois manques cumulés constituent ce que l'EU AI Act appelle, à l'article 14 et à l'article 26(6), un défaut de supervision humaine et un défaut de tenue de journaux d'événements. **À partir du 2 décembre 2027**, l'enforcement haut-risque s'applique : ces défauts deviennent sanctionnables — jusqu'à 35 millions d'euros ou 7 % du chiffre d'affaires mondial.

### 2.3. Une fenêtre d'action de 18 mois

Le calendrier est aujourd'hui calé. Entre juin 2026 et décembre 2027, les entreprises ont environ **18 mois** pour structurer leur gouvernance agentique : nommer un responsable, documenter chaque agent, construire le journal de décisions, formaliser un kill switch, et démontrer aux instances de gouvernance interne (comité d'audit, comité des risques, conseil d'administration) qu'un cadre est en place.

ACF® a été conçu pour rendre ces 18 mois opérables sans recommencer à zéro. Le framework est un ensemble de gestes posés — pas une déclaration d'intention.

---

## 3. La catégorie « gouvernance agentique » et la place d'ACF®

### 3.1. Chaque domaine a son référentiel dominant

Les domaines de gouvernance numérique se sont construits par cristallisation autour d'un référentiel structurant :

| Domaine | Référentiel dominant |
| --- | --- |
| Cybersécurité | ISO/IEC 27001 |
| Vie privée | RGPD |
| Intelligence artificielle | ISO/IEC 42001 |
| IA réglementée | EU AI Act |
| **Gouvernance agentique** | **ACF®** |

ISO 27001 n'a pas remplacé les pratiques de sécurité existantes : il les a rendues lisibles, certifiables, comparables. Le RGPD n'a pas inventé la protection des données : il l'a transformée en obligation universelle dans l'Union. ISO/IEC 42001 ne réécrit pas la science des données : elle la dote d'un système de management opposable. L'EU AI Act ne crée pas l'IA : il en encadre les usages à risque.

ACF® s'inscrit dans cette filiation. **L'autonomie des systèmes n'est pas un sous-thème de l'IA** ; c'est un domaine en soi, avec ses risques propres (dérive, hallucination opérationnelle, escalade non contrôlée), ses rôles propres (DDAO), ses garde-fous propres (kill switch, niveaux d'autonomie N0-N3, registre de décisions cryptographique).

### 3.2. ACF® n'est pas un challenger des standards. C'est leur couche d'exécution.

Les référentiels existants gouvernent **l'IA**. ACF® gouverne **les décisions prises par des systèmes autonomes**.

L'EU AI Act vous dit que le système d'IA est régulé. ISO/IEC 42001 vous dit comment gérer votre portefeuille d'IA. Le NIST AI RMF vous dit quels risques rendre visibles. Le RGPD vous dit qui doit consentir. À l'instant où un agent **agit** — fixe un prix, accorde un crédit, réserve un vol, appelle une API — aucun de ces référentiels ne vous dit qui a signé cette décision précise, face à quelle constitution agentique, avec quel kill switch, audité par qui et conservé combien de temps.

C'est cette couche qu'ACF® formalise. Les 17 fiches méthodologiques en sont le vocabulaire opérationnel.

---

## 4. Le framework ACF® — principes, couches, niveaux, rôles

### 4.1. Les 4 principes fondateurs

ACF® repose sur quatre principes axiomatiques, indépendants du protocole technique utilisé en sous-couche.

**P1 — Séparation décision / exécution.** L'agent peut exécuter ; il ne peut pas décider seul des décisions stratégiques critiques (engagement contractuel, écart financier au-delà d'un seuil, transfert international de données, action irréversible sur un actif réel). Ces décisions sont toujours humaines, ou suspendues.

**P2 — Zones non-déléguables.** Certaines décisions ne sont jamais déléguables, quel que soit le niveau d'autonomie de l'agent et quelle que soit la maturité de l'organisation. Elles sont énumérées dans la constitution agentique de chaque organisation (fiche ACF-03).

**P3 — Traçabilité et interruptibilité.** Toute action agentique est journalisée dans un registre cryptographiquement signé (fiche ACF-08). Toute action peut être interrompue à n'importe quel moment via un kill switch opérationnel (fiche ACF-06) dont l'effectivité est testée.

**P4 — Gouvernance vivante.** Le cadre de gouvernance évolue avec les capacités des agents. Une revue formelle au moins trimestrielle (fiches ACF-05 et ACF-10) ajuste les niveaux d'autonomie, les seuils d'escalade et les zones non-déléguables.

### 4.2. Les 4 couches opérationnelles

ACF® se déploie sur quatre couches imbriquées :

- **C1 — Stratégique.** Charte de souveraineté agentique, comité de gouvernance, matrice RACI organisationnelle, désignation du DDAO.
- **C2 — Tactique.** Objectifs pondérés par agent, règles d'arbitrage automatique, seuils d'escalade humaine.
- **C3 — Opérationnelle.** Mandat de chaque agent (fiche ACF-12), périmètre d'interaction autorisé, catégorisation par niveau de criticité (fiche ACF-02).
- **C4 — Technique.** Gating adaptatif, alertes multi-niveaux, KPIs de souveraineté en temps réel, dashboards opérables par le DDAO et son équipe.

### 4.3. Les 4 niveaux d'autonomie — N0 à N3

ACF® classe les agents par niveau d'autonomie. Le niveau **N2** est la cible recommandée pour la majorité des cas d'usage en production en 2026-2027.

- **N0 — Automatisation classique.** Règles fixes, aucun apprentissage. Toute modification passe par un changement humain.
- **N1 — Agents assistés.** L'agent analyse, hiérarchise et recommande. La décision finale reste systématiquement humaine.
- **N2 — Agents gouvernés.** L'agent décide dans un cadre strict (constitution agentique + zones non-déléguables verrouillées + kill switch testé + registre signé). C'est le niveau visé par défaut pour le commerce agentique en production.
- **N3 — Autonomie supervisée.** L'agent décide et apprend. Réservé à des cas spécifiques. Exige le niveau de gouvernance le plus mature (revue mensuelle, double DDAO, audit externe semestriel).

La progression recommandée est N0 → N1 → N2 → N3. Chaque passage à un niveau supérieur déclenche les contrôles de la fiche ACF-00 (Score de Souveraineté).

### 4.4. Le rôle DDAO — Designated Delegated Agent Officer

Le **DDAO** est la pierre angulaire humaine d'ACF®. C'est la personne physique ou l'organe collégial nommément désigné comme responsable d'un agent (ou d'un portefeuille d'agents) en production.

Le DDAO porte quatre missions opérationnelles :

1. **Validation des décisions critiques** que l'agent est conçu pour escalader.
2. **Arbitrage en cas d'escalade non prévue** (situation hors mandat, comportement de dérive, signal d'alerte du registre).
3. **Suivi des dérives** dans la durée (drift de modèle, drift de distribution des cas, drift de coûts).
4. **Conduite des revues périodiques** sur le périmètre confié.

Le rôle DDAO est inspiré de deux fonctions déjà reconnues dans le droit et la pratique des organisations : le **DPO** (Délégué à la Protection des Données, RGPD article 37-39) et le **CISO** (Chief Information Security Officer). Comme eux, le DDAO est indépendant de la chaîne hiérarchique de l'agent qu'il supervise, dispose d'un accès direct aux organes de gouvernance, et engage la responsabilité juridique de l'entreprise. Le rôle est défini par la fiche **ACF-12 (Mandat d'Agent)** et instrumenté par la simulation **ACF-15 (Simulation de Gouvernance)**.

---

## 5. Les 17 fiches méthodologiques

ACF® n'est pas une doctrine théorique. Le standard se déploie à travers dix-sept fiches méthodologiques numérotées **ACF-00 à ACF-16**, prêtes à être imprimées, remplies, signées, archivées. Chaque fiche est un objet de gouvernance opposable.

| Code | Titre | Objet |
| --- | --- | --- |
| ACF-00 | Score de Souveraineté | Évalue le niveau de souveraineté décisionnelle conservé. |
| ACF-01 | Carte Décisionnelle | Cartographie les décisions de l'agent et la chaîne d'approbation. |
| ACF-02 | Matrice de Criticité | Classifie chaque agent par criticité, impact, irréversibilité. |
| ACF-03 | Constitution Agentique | Charte interne — qui décide quoi, comment, avec quelles limites. |
| ACF-04 | Fiche Agent | Identité opérationnelle : périmètre, données, outils, autonomie. |
| ACF-05 | Supervision & Gouvernance | Mécanismes de supervision continue. |
| ACF-06 | Kill Switch | Procédure d'arrêt d'urgence (trois niveaux). |
| ACF-07 | Dossier Premier Agent | Dossier de qualification avant la mise en production. |
| ACF-08 | Registre des Décisions Agentiques | Journal cryptographique signé. |
| ACF-09 | Plan d'Action & Amélioration | Plan post-déploiement. |
| ACF-10 | Audit Gouvernance 30 jours | Audit interne périodique. |
| ACF-11 | Évaluation des Risques Agentiques | Analyse spécifique : drift, hallucination, escalade. |
| ACF-12 | Mandat d'Agent | Délégation formelle au DDAO. |
| ACF-13 | Cas Pratique Guidé | Cas d'usage commenté pour formation et audit blanc. |
| ACF-14 | Guide Enseignant | Déroulé pédagogique pour formateurs. |
| ACF-15 | Simulation de Gouvernance | Exercice de bac à sable. |
| ACF-16 | Responsabilité par Design | Principe transversal d'accountability. |

Les fiches sont publiques pour les enseignants, formateurs, chercheurs et établissements de formation (sous Charte d'utilisation pédagogique). Pour les organisations en déploiement, elles sont accompagnées d'un **manuel ACF® Toolkit** de 130 pages, d'un **deck d'introduction** et de **cinq cas pédagogiques calibrés** (école de commerce, école d'ingénieur, MBA, EMBA, master IA). L'ensemble est versionné, traçable, citable.

---

## 6. La méthodologie de déploiement

### 6.1. Trois phases sur 6 à 18 mois

Un déploiement ACF® se structure en trois phases. Chaque phase produit des livrables opposables, datés, signés par le DDAO et par les fonctions concernées.

**Phase 1 — Cadrage (mois 1 à 3).** Calcul du Score de Souveraineté initial (ACF-00). Cartographie décisionnelle des agents existants ou planifiés (ACF-01). Construction de la matrice de criticité (ACF-02). Rédaction de la constitution agentique (ACF-03). Désignation du DDAO et formalisation du comité de gouvernance.

**Phase 2 — Déploiement (mois 4 à 9).** Pour chaque agent : élaboration du dossier premier agent (ACF-07), production de la fiche agent (ACF-04), mise en place du mandat (ACF-12), implémentation du kill switch testé (ACF-06), branchement du registre signé (ACF-08), audit de gouvernance initial à 30 jours (ACF-10).

**Phase 3 — Régime de croisière (mois 10 à 18).** Plan d'action et d'amélioration continue (ACF-09). Évaluation continue des risques (ACF-11). Simulation de gouvernance trimestrielle (ACF-15). Revue annuelle. Préparation de l'audit externe et — pour les organisations qui le souhaitent — de la certification ACF® (Level 1, 2 ou 3).

### 6.2. Les six personnes clés du déploiement

Un déploiement ACF® mobilise typiquement six fonctions internes coordonnées par le DDAO :

- **Direction générale** (sponsor, valide la constitution agentique),
- **DSI** (instrumente le registre signé et le kill switch),
- **RSSI / CISO** (valide l'architecture cryptographique),
- **DPO** (vérifie l'articulation RGPD, notamment l'article 22),
- **Direction juridique** (contrôle la conformité EU AI Act et la rédaction des mandats),
- **Métier sponsor** (décrit le cas d'usage, valide les seuils d'escalade).

L'agent lui-même n'est pas membre du comité.

---

## 7. Le protocole d'arrêt d'urgence à trois niveaux

Un mécanisme d'arrêt agentique efficace n'est pas un simple interrupteur. ACF® spécifie trois niveaux d'interruption, avec des temps de réponse et des procédures d'escalade définies. La fiche **ACF-06 (Kill Switch)** documente leur mise en œuvre. La fiche **ACF-15 (Simulation de Gouvernance)** impose un exercice trimestriel.

**Niveau 1 — Pause opérationnelle.** Temps de réponse : moins de 30 secondes. Suspension des opérations non critiques. L'agent termine les actions en cours mais n'en initie plus de nouvelles. Déclenchement automatique (sur signal d'alerte du registre) ou manuel (DDAO ou opérateur de premier niveau).

**Niveau 2 — Arrêt décisionnel.** Temps de réponse : moins de 5 secondes. Suspension complète de toute prise de décision. Toutes les décisions en attente sont redirigées vers des opérateurs humains. Déclenchement par le DDAO ou un membre du comité de gouvernance.

**Niveau 3 — Arrêt système total.** Temps de réponse : moins de 1 seconde. Interruption complète de tous les systèmes agentiques. Basculement vers les processus manuels de secours. Réservé au comité de gouvernance ou à la direction générale.

Chaque niveau est testé via les exercices trimestriels de simulation. Un kill switch documenté mais jamais testé n'est pas un kill switch.

---

## 8. ACF® face aux référentiels existants — la matrice de correspondance

Chaque fiche ACF® est mappée sur les cinq référentiels majeurs : **EU AI Act, ISO/IEC 42001, NIST AI RMF, RGPD, COBIT 2019**. Le mapping est délibérément conservateur — quand une fiche concerne plusieurs articles, seul l'article principal est cité. La cartographie complète (avec références secondaires) est reproduite dans le manuel ACF® Toolkit et exposée sous forme machine-lisible par le serveur MCP `acf-mcp`.

| Fiche ACF® | EU AI Act | ISO/IEC 42001 | NIST AI RMF | RGPD | COBIT 2019 |
| --- | --- | --- | --- | --- | --- |
| ACF-00 Score de Souveraineté | Art. 9 | 6.1.2 | MAP-3 | Art. 35 | EDM-01 |
| ACF-01 Carte Décisionnelle | Art. 14 | 8.4 / A.6 | GOVERN-1.1 | Art. 22 | EDM-03 |
| ACF-02 Matrice de Criticité | Art. 6 + Ann. III | 6.1.2 | MAP-2 | Art. 35 | APO-12 |
| ACF-03 Constitution Agentique | Art. 5 + 26 | 5.2 | GOVERN-2 | Art. 25 | EDM-01 |
| ACF-04 Fiche Agent | Art. 11 + 26(6) | 7.5 + 8.1 | MAP-1 | Art. 30 | BAI-09 |
| ACF-05 Supervision & Gouvernance | Art. 14 + 26(5) | 5.3 + 9.1 | GOVERN-3 / MANAGE-2.3 | Art. 22 + 37-39 | MEA-02 |
| ACF-06 Kill Switch | Art. 14(4) + 26(5) | 8.3 | MANAGE-4 | Art. 22(3) | DSS-02 |
| ACF-07 Dossier Premier Agent | Art. 11-13 + 17 | 8.1 + 6.2 | MAP-2 + GOVERN-4 | Art. 30 + 35 | BAI-01 |
| ACF-08 Registre des Décisions | Art. 12 + 19 + 26(6) | 9.1 + 7.5.3 | MEASURE-2 | Art. 30 | MEA-01 |
| ACF-09 Plan d'Action & Amélioration | Art. 9(4) + 17 | 10.1 + 10.2 | MANAGE-2 | Art. 24 + 32 | BAI-08 |
| ACF-10 Audit Gouvernance 30 jours | Art. 17 + 71 | 9.2 + 9.3 | GOVERN-5 + MANAGE-3.1 | Art. 32 | MEA-02 + MEA-03 |
| ACF-11 Évaluation des Risques | Art. 9 | 6.1.2 | MAP-3 + MAP-4 | Art. 35 | APO-12 |
| ACF-12 Mandat d'Agent | Art. 16 + 17 + 26 | 5.3 | GOVERN-3 + GOVERN-6 | Art. 28 + 24 | APO-05 |
| ACF-13 Cas Pratique Guidé | Art. 6 + 13 | 7.2 + 7.3 | MAP-2 | Art. 22 | BAI-05 |
| ACF-14 Guide Enseignant | Art. 4 | 7.2 + 7.3 | GOVERN-1.6 + GOVERN-6 | Art. 39 | APO-07 |
| ACF-15 Simulation de Gouvernance | Art. 9 + 57-63 | 9.1 + 6.2 | MANAGE-3 + MEASURE-3 | Art. 32 | BAI-06 |
| ACF-16 Responsabilité par Design | Art. 5 + 13 + 16(b) | 5.2 | GOVERN-1 + MANAGE-1 | Art. 5(2) + 24 + 25 | EDM-01 |

**Lecture.** La fiche ACF-08 (Registre des Décisions Agentiques) implémente directement l'obligation de l'article 12 de l'EU AI Act sur l'enregistrement automatique des événements et l'article 26(6) sur la conservation des logs pendant au moins six mois par le déployeur ; côté ISO/IEC 42001 elle relève de la clause 9.1 (monitoring, measurement, analysis, evaluation) ; côté NIST AI RMF de la fonction MEASURE-2 (Performance & Trustworthiness) ; côté RGPD de l'article 30 (registre des activités de traitement) ; et côté COBIT de l'objectif MEA-01 (Performance Monitoring). Une équipe conformité qui déploie ACF-08 produit en même temps les pièces que ces cinq référentiels exigent.

---

## 9. L'écosystème ACF® — neuf vecteurs d'opérationnalisation

ACF® n'est pas seulement un standard documentaire. **Quatre outils gratuits**, **quatre produits commerciaux** et **un serveur MCP open source**, conçus pour des publics distincts, l'opérationnalisent.

### Outils gratuits

#### 9.1. ACF Score — auto-diagnostic de souveraineté

Score composite de souveraineté décisionnelle calculé sur six dimensions. Outil libre d'accès, sans inscription. Cible : direction générale et direction informatique souhaitant un premier diagnostic en moins de 15 minutes. `www.acf-score.com`.

#### 9.2. ACF AI Act Checker — vérification de conformité AI Act

Vérification rapide de l'exposition d'un système à l'EU AI Act : catégorisation du risque (prohibé / haut risque / risque limité / risque minimal), articles applicables et obligations associées. Outil libre d'accès. Cible : direction juridique, conformité, DPO en première lecture. `www.acfstandard.com/fr/compliance-checker`.

#### 9.3. Audit Flash de conformité — diagnostic en 15 minutes

Diagnostic compact, structuré sur les axes critiques de gouvernance agentique (supervision humaine, traçabilité, kill switch, rôle DDAO, registre des décisions). Restitution immédiate sous forme de rapport téléchargeable. Cible : équipe métier, sponsor projet, RCSI, DPO souhaitant cadrer un dossier avant un audit ou un comité. `compliance.acfstandard.com/fr/start`.

#### 9.4. Plan Compliance personnalisé — feuille de route

À partir des résultats de l'Audit Flash, génération d'une feuille de route de mise en conformité priorisée sur trois phases (cadrage / déploiement / régime de croisière), articulée sur les 17 fiches ACF® et ventilée par fonction interne (DG, DSI, RSSI, DPO, juridique, métier). Outil gratuit. Cible : DDAO en prise de poste, équipe transformation, comité de pilotage projet.

### Produits commerciaux

#### 9.5. ACF Auditor — audit guidé

Plateforme d'audit guidé évaluant la maturité digitale et agentique d'une organisation sur sept dimensions pondérées (calibration sectorielle disponible). Génère un Agentic Readiness Score, un Score de Souveraineté détaillé et une feuille de route en trois phases. Cible : DSI et fonctions transformation.

#### 9.6. ACF Control — dashboard de gouvernance

Console temps réel qui surveille les KPIs de souveraineté avec gating adaptatif et escalade automatisée. Logs d'audit infalsifiables (Ed25519 + chaîne de hachage). Cible : équipes DSI/RSSI en exploitation.

#### 9.7. ACF Compliance — plateforme SaaS multi-juridiction

Le produit SaaS phare de l'écosystème, accessible sur `compliance.acfstandard.com`. Plateforme qui implémente chacune des correspondances ACF® / standards comme registre cryptographique multi-tenant. Trois plans : Starter (490 €/mois), Business (1 490 €/mois, populaire), Enterprise (sur devis). Cible : RCSI, DPO, direction juridique, équipes conformité.

#### 9.8. ACF Certification — attestation indépendante

Programme de certification indépendante en trois niveaux (Level 1, 2, 3). Badge publiquement vérifiable, renouvellement annuel, monitoring continu. Cible : organisations souhaitant rendre leur posture de gouvernance opposable à des tiers (clients, régulateurs, assureurs).

### Serveur MCP open source

#### 9.9. acf-mcp — serveur Model Context Protocol

Serveur MCP officiel d'ACF®, publié en open source sous licence MIT (package npm `acf-mcp` ; documentation développeur, manuel d'intégration et littérature de référence sur `acfstandard.io`). Expose la doctrine ACF® — quatre principes, quatre niveaux d'autonomie, le rôle DDAO, les dix-sept fiches méthodologiques, cinq guides régulatoires (AI Act, GDPR, DORA, NIS2, ISO 42001), le glossaire et le whitepaper — comme ressources MCP natives consommables par Claude Desktop, Cursor, Windsurf, Continue.

Le serveur embarque **huit outils de raisonnement déterministes** (REASON tools), bâtis sur une base de connaissance versionnée et signée — sans appel LLM interne :

1. `acf.advisor` — conseil structuré à partir d'un cas générique
2. `acf.classify-agent` — qualification préliminaire d'un agent à partir de dix champs énumérés
3. `acf.assess-autonomy` — recommandation N0-N3 + go/no-go + design du kill switch
4. `acf.identify-governance-gaps` — score de maturité 6 dimensions + remédiations priorisées
5. `acf.map-ai-act-obligations` — ensemble d'obligations EU AI Act ventilées par phase du cycle de vie
6. `acf.assign-ddao-controls` — contrôles DDAO recommandés selon niveau et risque
7. `acf.evaluate-agent-mandate` — audit en huit checks d'un mandat existant
8. `acf.map-to-standards` — correspondance ACF® × référentiels existants pour un cas donné

Chaque sortie d'outil REASON est signée (`doctrine_version`, `doctrine_hash`, `doctrine_archive_url`, `regulatory_snapshot`, `generated_at`) et explicitement positionnée comme **qualification préliminaire, pas conseil juridique** — `requires_human_review: true` est constant.

---

## 10. Différenciateurs techniques — preuve cryptographique

ACF® n'est pas qu'une grille de lecture. C'est une infrastructure de preuve, dont les trois pierres angulaires sont publiques et reproductibles.

### 10.1. Signature Ed25519 de chaque décision

Chaque décision agentique enregistrée dans le registre (fiche ACF-08) est signée par une paire de clés Ed25519 contrôlée par l'organisation. La clé publique est publiable. La clé privée est conservée selon les standards de l'ANSSI (HSM ou équivalent). Toute signature est vérifiable indépendamment, sans accès à l'infrastructure du déployeur.

### 10.2. Chaîne de hachage SHA-256

Chaque entrée du registre intègre le hash SHA-256 de l'entrée précédente, formant une chaîne de hachage chronologique. Toute tentative de modification rétroactive du registre se détecte en recalculant la chaîne. Le registre devient ainsi **opposable** : un auditeur, un régulateur ou un tribunal peuvent recomputer la chaîne et trancher.

### 10.3. Horodatage qualifié RFC 3161

Chaque entrée du registre est horodatée par un service qualifié RFC 3161 (Time Stamp Authority qualifiée au sens d'eIDAS). Cela donne à chaque décision une date opposable, vérifiable indépendamment du déployeur et de son fournisseur d'infrastructure. La pratique recommandée par ACF® est d'utiliser un horodateur PSCE référencé par l'ANSSI.

### 10.4. Export PDF certifié signé

Le registre peut produire à la demande un export PDF certifié, signé électroniquement (PAdES). Le PDF embarque la chaîne de hachage, les horodatages et la clé publique de l'organisation. Il est conçu pour être présentable à un auditeur ou à une autorité de contrôle dans son format natif, sans nécessiter d'outil supplémentaire.

---

## 11. À propos & contact

L'**Agentic Commerce Framework®** est créé et porté par **Vincent Dorange**. Le framework résulte de plusieurs années de recherche et de pratique sur la gouvernance des systèmes autonomes, et de l'observation directe de leurs premiers déploiements en production en 2025-2026 — dans le commerce, la finance, les services aux entreprises, la santé et l'énergie.

ACF® est édité par Vincent Dorange. Le standard documentaire (principes, fiches, doctrine) est diffusé sous licence ouverte. Les outils gratuits (ACF Score, ACF AI Act Checker, Audit Flash, Plan Compliance) et les produits commerciaux (ACF Auditor, ACF Control, ACF Compliance, ACF Certification) sont accessibles via les URL ci-dessous. Le serveur MCP `acf-mcp` est open source (licence MIT) et publié sur npm.

**Contact**
Site officiel — `www.acfstandard.com`
AI Act Checker (gratuit) — `www.acfstandard.com/fr/compliance-checker`
Audit Flash & Plan Compliance (gratuits) — `compliance.acfstandard.com/fr/start`
ACF Compliance (SaaS) — `compliance.acfstandard.com`
ACF Score (diagnostic libre) — `www.acf-score.com`
Documentation développeur & MCP — `acfstandard.io`
Standard ACF® · Édition juin 2026

---

## 12. Mentions

ACF® et Agentic Commerce Framework® sont des marques déposées. La méthodologie (fiches, doctrine, schémas) est protégée et diffusée sous licence ouverte pour usage pédagogique, de recherche et de conformité interne. Tout usage commercial du nom ACF® dans un produit ou un service tiers requiert un accord écrit préalable de l'éditeur.

L'ensemble des correspondances avec l'EU AI Act, ISO/IEC 42001, NIST AI RMF, RGPD et COBIT 2019 publiées dans ce document est délibérément conservateur. Le mapping complet, incluant les références secondaires et les notes interprétatives, est reproduit dans le manuel ACF® Toolkit et exposé sous forme machine-lisible par le serveur `acf-mcp` (outil `acf.map-to-standards`).

Le présent document est un livre blanc. Il n'a pas vocation à se substituer à un conseil juridique, comptable ou réglementaire. Toute mise en œuvre opérationnelle doit être adaptée au contexte de l'organisation et validée par les fonctions internes compétentes.

© 2026 Agentic Commerce Framework® — Vincent Dorange.
Tous droits réservés. ACF® est une marque déposée.

---

*Sources : EU AI Act (Règlement (UE) 2024/1689) · ISO/IEC 42001:2023 · NIST AI RMF 1.0 (2023) · RGPD (Règlement (UE) 2016/679) · COBIT 2019. Données sectorielles : Bain & Company, Gartner, Forrester, IFOP, communications officielles des éditeurs cités (Visa, Mastercard, Stripe, OpenAI, Anthropic, Google, Walmart, Wells Fargo, Klarna, Expedia, Sephora) — état au 1er juin 2026.*
