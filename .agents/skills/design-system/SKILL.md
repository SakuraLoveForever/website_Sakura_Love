---
name: design-system-upscayl
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# Upscayl

## Mission
Deliver implementation-ready design-system guidance for Upscayl that can be applied consistently across marketing site interfaces.

## Brand
- Product/brand: Upscayl
- URL: https://upscayl.org/download
- Audience: buyers, teams, and decision-makers
- Product surface: marketing site

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=DM Sans`, `font.family.stack=DM Sans, sans-serif`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=24px`
- Typography scale: `font.size.xs=14px`, `font.size.sm=16px`, `font.size.md=18px`, `font.size.lg=20px`, `font.size.xl=24px`, `font.size.2xl=30px`, `font.size.3xl=48px`, `font.size.4xl=60px`
- Color palette: `color.text.primary=#e8e6e3`, `color.text.secondary=#b0a99f`, `color.text.tertiary=#c9d7e3`, `color.text.inverse=#9d9487`, `color.surface.base=#000000`, `color.surface.muted=#181a1b`, `color.surface.raised=#0c1222`, `color.surface.strong=#293444`, `color.border.default=#8c8273`, `color.border.muted=#6f675b`
- Spacing scale: `space.1=4px`, `space.2=8px`, `space.3=16px`, `space.4=24px`, `space.5=32px`, `space.6=40px`, `space.7=80px`, `space.8=128px`
- Radius/shadow/motion tokens: `radius.xs=14px`, `radius.sm=9999px` | `motion.duration.instant=150ms`, `motion.duration.fast=300ms`, `motion.duration.normal=500ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
