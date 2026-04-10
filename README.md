# Logic Simulation — SPPU AI Unit 4

Interactive simulation for **Savitribai Phule Pune University (SPPU)** Third Year Computer Engineering — **310253: Artificial Intelligence**, Unit 4: Knowledge.

## Live Demo

Open the live version on GitHub Pages (link will be active after deployment).

## What's Inside

An interactive, mobile-friendly web simulation covering:

1. **PL vs FOL** — Side-by-side comparison of Propositional Logic and First-Order Logic with live examples
2. **Inference Rules** — Animated step-by-step demos for all 6 inference rules:
   - Modus Ponens
   - Modus Tollens
   - And-Introduction
   - And-Elimination
   - Or-Introduction
   - Resolution
3. **FOL Builder** — Interactive symbol palette with quantifiers (∀, ∃), predicates, functions, and auto-parser
4. **Resolution Prover** — Custom resolution engine where students can input their own CNF clauses
5. **Chain Proof Demos** — Combined proofs (Rain→Slippery Road, West is Criminal, Rahul Respects Sunita, etc.)

## How to Run Locally

Just open `index.html` in any modern browser. No build step, no dependencies.

```bash
# Or serve via Python
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Topics Covered (per SPPU Syllabus)

- Logical Agents
- Knowledge-Based Agents (TELL/ASK cycle)
- Propositional Logic syntax & semantics
- Truth tables and connectives (¬, ∧, ∨, ⇒, ⇔)
- Inference rules and theorem proving
- Resolution algorithm (proof by contradiction)
- First-Order Logic (quantifiers, predicates, functions)
- Converting English to FOL

## Reference

Russell & Norvig, *Artificial Intelligence: A Modern Approach*, 3rd Edition — Chapters 7, 8, 9.

## License

MIT — Free for students to use, modify, and share.
