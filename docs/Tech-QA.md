# **AI Admissions Copilot — Investor Technical Q&A Playbook**

---

## **1. “Isn’t this just a wrapper around ChatGPT?”**

**Best answer:**

> No. ChatGPT is one component, not the product.
> The value comes from domain-specific grounding, multi-agent orchestration, and browser-level execution.

Then explain briefly:

* We maintain a curated admissions knowledge base grounded in official policies.
* Specialized agents handle strategy, essays, policy interpretation, and execution.
* The browser extension allows the system to act inside real admissions portals.

**Close with:**

> Generic chatbots give advice. Our system completes workflows.

---

## **2. “Why do you need a RAG system if admissions info is public?”**

**Best answer:**

> Public does not mean reliable or current. Admissions policies change yearly and vary by program, citizenship, and degree level.

Key points:

* LLMs rely on training snapshots and may be outdated.
* RAG ensures answers are grounded in the latest official sources.
* It reduces hallucinations and allows us to show citations.

**Investor framing:**

> For a high-stakes decision system, accuracy and trust are non-negotiable.

---

## **3. “What’s your real technical moat?”**

**Best answer:**

> The moat is execution + domain intelligence, not the model itself.

Break it down:

1. Browser extension that executes inside real portals
2. Structured admissions knowledge base
3. Multi-agent orchestration
4. Continuous feedback loop from real user workflows

**Close with:**

> This is infrastructure, not prompts.

---

## **4. “How hard is the browser extension to build and maintain?”**

**Best answer:**

> Technically challenging, but very defensible.

Explain:

* We do not hard-code full portals.
* We maintain abstract “portal schemas” and field mappings.
* Autofill requires user confirmation — no blind automation.
* Extension logic is reusable across platforms.

**Signal maturity:**

> This is exactly why it’s a moat — it’s painful but valuable.

---

## **5. “How do you prevent hallucinations or bad advice?”**

**Best answer:**

> We constrain the AI instead of trusting it blindly.

Mechanisms:

* Retrieval-grounded prompts
* Explicit instructions to rely only on provided sources
* Structured JSON outputs
* Warnings when data is missing or ambiguous
* User review before execution

**Key phrase:**

> The system is designed to say “I don’t know” when appropriate.

---

## **6. “How do you keep the knowledge base up to date?”**

**Best answer:**

> We control the source of truth.

Explain:

* Scheduled ingestion of official admissions pages
* Manual overrides for high-impact schools
* Extension can flag discrepancies when live pages change
* Versioned knowledge entries by admissions cycle

**Investor reassurance:**

> Updating policies is a data operation, not a product rebuild.

---

## **7. “What happens when universities redesign their websites?”**

**Best answer:**

> Website changes are expected, and the system is designed for it.

Explain:

* We rely on semantic extraction, not brittle selectors.
* The extension can fall back to explanation mode even if autofill is disabled.
* Field mappings are updated incrementally.

**Confidence signal:**

> This is a maintenance cost, not an existential risk.

---

## **8. “How do you handle privacy and sensitive student data?”**

**Best answer:**

> Student data is treated as high-sensitivity educational data.

Mention:

* Encrypted storage and transport
* Role-based access control
* No automatic submission without user approval
* Audit logs for AI actions

**Close with:**

> We design for parent-level trust, not just student convenience.

---

## **9. “How do AI costs scale as usage grows?”**

**Best answer:**

> AI costs scale sub-linearly with users.

Explain:

* Reuse of embeddings and retrieval results
* Caching of common explanations
* Short, structured prompts
* Most users follow similar workflows

**Investor-friendly line:**

> Margins expand as the system learns.

---

## **10. “What’s the failure mode of the system?”**

**Best answer:**

> The system degrades gracefully.

Examples:

* If data is missing → explain uncertainty
* If autofill is risky → switch to guidance-only mode
* If policies conflict → flag and ask user to verify

**Key framing:**

> The AI never acts without user visibility.

---

## **11. “Could OpenAI or another platform just build this?”**

**Best answer:**

> Large model providers don’t specialize in domain execution.

Explain:

* They build general models, not admissions infrastructure.
* The value is in:

  * domain curation
  * workflow design
  * browser execution
  * distribution into schools

**Close with:**

> We’re closer to TurboTax than to a chatbot.

---

## **12. “What’s the hardest technical problem you’re solving?”**

**Best answer:**

> Turning unstructured admissions chaos into structured, executable workflows.

Explain:

* Policy interpretation
* Edge cases across programs and countries
* Safe automation
* Trust-worthy AI outputs

**Investor signal:**

> This is a systems problem, not a prompt problem.

---

## **13. “What would break this business technically?”**

**Best answer:**

> If admissions became fully standardized and machine-readable overnight.

Then smile and say:

> The opposite trend is happening.

---

## **14. “What do you build in-house vs rely on vendors for?”**

**Best answer:**

> We rely on vendors for base models and infrastructure, and build everything workflow-critical in-house.

In-house:

* knowledge curation
* agent orchestration
* autofill logic
* portal schemas
* UX & trust mechanisms

---

## **15. “What convinces you this can replace consultants?”**

**Best answer:**

> Consultants spend most of their time explaining policies, managing timelines, and formatting applications — all of which software does better.

Close with:

> Human judgment remains, but human labor does not need to scale.

---

# 🧠 How to use this in meetings

* Don’t over-explain
* Answer in **30–60 seconds**
* Anchor back to **trust, execution, and scalability**
* Always end with a **confident framing sentence**

---
