# Product

## Register

product

## Platform

web

## Users

The primary users of this fixture are the mixed usabl project team. They include
engineers, accessibility reviewers, product and UX contributors, demo operators,
and teammates who do not write code.

They use the fixture to understand the product, test accessibility behavior, and
prepare a repeatable contest demonstration.

## Product Purpose

usabl-app makes the usabl accessibility proof loop visible and understandable. A
teammate can experience real accessibility barriers, see one gate-owned result
across the development overlay, Claude workflow, and pull request checks, then see
that result change after the barriers are repaired.

The initial team demo succeeds when a nondeveloper can explain what usabl found,
why the result blocks completion, what changed, and why the repaired code is now
verified.

## Positioning

usabl does not stop at reporting accessibility findings. It decides whether the
affected work is verified, has a regression, is not covered, or needs human
approval. Every product surface projects that same decision.

## Brand Personality

Direct, trustworthy, and practical. The interface should feel like a mature
PatternFly operations product with an accessibility inspector built into the
development workflow.

## Anti-references

Do not build a sparse test page that hides the product behind one subtle defect.
Do not build a random collection of broken controls without a user task. Avoid
dashboard tile walls, fake terminal output, decorative charts, and separate demos
that make each product surface look like a different system.

## Design Principles

1. Start with the barrier a person experiences, then show the finding.
2. Let one result travel through the overlay, Claude, and pull request checks.
3. Pair broken and repaired behavior so the change is visible and repeatable.
4. Keep demo controls separate from the interface being tested.
5. Use realistic operations tasks and only claim behavior the engine checks.

## Accessibility & Inclusion

The demo shell and controls target WCAG 2.2 AA. Deliberate barriers live only in
clearly identified test scenarios. They must not block access to scenario controls,
instructions, recovery actions, or the overlay. Support keyboard use, visible
focus, reduced motion, 200 percent zoom, and status meaning that does not depend on
color alone.
