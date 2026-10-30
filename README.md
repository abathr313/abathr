# Abathr Maged — Mobile & Full-Stack Developer

[Live portfolio](https://abathr313.github.io/abathr/) · [LinkedIn](https://www.linkedin.com/in/abathrmaged-8293a8383) · [CV](assets/documents/Abathr-Maged-CV.pdf)

I build mobile applications, web products, business systems and automation. My tools include Flutter, React Native, React, Python, Node.js, C#/.NET, Firebase and relational databases.

## Selected work

| Project | What it demonstrates | Live project |
| --- | --- | --- |
| Logba | Logistics workflows, role-based dashboards, shipment tracking and CSV export | [Open](https://logba-ded0a.web.app) |
| Rose Pharmacy | Arabic e-commerce interface, search, favourites and cart | [Open](https://rus1-fb25c.web.app) |
| Dr. Nazik Clinic | Responsive Arabic website and service presentation | [Open](https://dr-nazikclinic-cdb8b.web.app) |
| Headway English | Interactive learning, lessons, review and progress | [Open](https://headway-leth-english.web.app) |

![Logba — actual project screenshot](assets/projects/logba.webp)

## Engineering lab

[Try the interactive models](https://abathr313.github.io/abathr/lab/). These are new portfolio demonstrations with synthetic data, not client deployments.

- **Shipment reconciliation:** validates two CSV manifests, matches by shipment ID, flags duplicate/missing/unexpected records and weight discrepancies, and exports a report. Duplicate weights are excluded from delta calculations.
- **Field inspection queue:** checklist validation, device-local persistence, simulated network failures, and retry transitions preserving each report ID. Synchronization is explicitly simulated; no server receives these reports.

Pure data operations live in `lab/engine.js`. Run their edge-case tests with `node --test lab/engine.test.cjs`.

## Certificates

Eight original certificate images are available in the [portfolio gallery](https://abathr313.github.io/abathr/#certificates), with issuer verification links extracted from the supplied CV. These are course-completion and professional-learning certificates, not university degrees. Images were extracted from the original certificate PDFs; no certificate content was generated or altered.

## Run locally

This is a static GitHub Pages site. It requires no build, framework, database or secret keys.

```sh
python -m http.server 8080
```

Open `http://localhost:8080`. Keep all file paths relative so the site works under `/abathr/`.

The contact form opens a draft in the visitor's email application. Sending happens in that application; the site does not claim to deliver messages itself.

## Structure

- `index.html`: Arabic content, selected projects, certificate cards and accessible navigation.
- `style.css`, `script.js`: original layout and navigation, with corrected contact behaviour.
- `portfolio.css`, `portfolio.js`: focused visual improvements and keyboard-accessible certificate viewer.
- `lab/`: interactive engineering models, data engine and tests.
- `assets/certificates/`: original certificate previews.
- `assets/projects/`: actual screenshots of the featured projects.
- `assets/documents/`: downloadable CV.

Existing Android download links and additional project links are retained. This repository contains the portfolio presentation; the linked projects have their own implementations.

## Certificate → applied work

| Certificate | Working example | Native source |
| --- | --- | --- |
| CS50 Python | Shipment Quality: CSV validation and reconciliation | Python, with tests and synthetic fixtures |
| CS302 Software Engineering | Field inspection state and retry queue | JavaScript |
| Foundational C# with Microsoft | Log Desk: service log triage | C# source and run instructions |
| Responsive Web Design | Dr. Nazik Clinic responsive Arabic site | Existing live project |
| Introduction to JavaScript I | Headway English interactive learning | Existing live project |
| Cisco Networking Basics | Branch VLSM address planner | JavaScript |
| Introduction to C++ | Stock Flow FEFO batch allocation | C++17 source and synthetic fixtures |
| Google Display & Video 360 | Campaign budget pacing and KPI desk | JavaScript |

New systems are portfolio demonstrations, not issuer-endorsed products. Browser versions run JavaScript; downloadable Python/C#/C++ sources are explicitly identified. Python and browser data engines are tested. C# and C++ sources were reviewed but not compiled on this machine because the required SDK/compiler was unavailable. No APK or EXE build is claimed.

The existing local pharmacy project (Flutter/SQLite/Firebase), wholesale ERP foundation (TypeScript/PostgreSQL/Next.js), and basic LogFileViewer source informed the case studies. Their operational databases, credentials, private configuration, and original source files were not uploaded or modified. ERP is described as a foundation, consistent with its own README.

### Market context

The examples focus on operational data quality, support diagnostics, inventory workflows, infrastructure planning and campaign operations. These choices are informed by [Upwork's 2026 in-demand skills](https://www.upwork.com/press/releases/upworks-in-demand-skills-2026-demand-for-top-ai-skills-more-than-doubles-as-ai-is-embedded-into-everyday-work) (full-stack, automation, data analytics and display advertising) and [WEF's 2025 skills outlook](https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/3-skills-outlook/) (networks and technology skills). This supports the choice of skill areas, not a claim that any specific demo guarantees employment.

```sh
node --test lab/engine.test.cjs systems/engine.test.cjs
python -m unittest discover -s systems/source/python -p "test_*.py"
```
