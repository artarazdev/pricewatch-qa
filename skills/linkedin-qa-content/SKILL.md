---
name: linkedin-qa-content
description: 'Trigger: LinkedIn post, QA content, editorial calendar, content catalog. Draft evidence-based Spanish QA Automation posts for PriceWatch QA.'
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: '1.0'
---

# LinkedIn QA Content

## Activation Contract

Use this skill when preparing, reviewing, scheduling, or cataloging LinkedIn content drawn from PriceWatch QA.

## Hard Rules

- Write posts in Spanish.
- Tuesday: one minipill from completed project practice. State the problem, technique, and lesson. Never claim planned or unimplemented work.
- Thursday: QA Automation theory selected from a reviewed visual asset. Do not present theory as project behavior without evidence.
- Require a reviewed image or diagram; otherwise return a GUI image-generation brief.
- Do not publish, schedule, or access LinkedIn. A human approves every final post.
- Do not expose secrets, personal data, private URLs, or unreviewed screenshots.

## Decision Gates

| Publication day | Focus                      | Required evidence                              |
| --------------- | -------------------------- | ---------------------------------------------- |
| Tuesday         | Completed project practice | Repository or PKM source                       |
| Thursday        | QA Automation theory       | Reviewed visual asset and accurate explanation |

## Execution Steps

1. Select a backlog item with a source.
2. Confirm completed practice on Tuesday, or an approved visual asset on Thursday.
3. Draft a concise hook, explanation, practical takeaway, and restrained call to action.
4. Produce an image brief when the catalog has no approved asset.
5. Return the draft, source links, selected asset or brief, and a final human-review checklist.

## Output Contract

Return exactly these sections: `Post draft`, `Evidence`, `Visual`, and `Human review`.

## References

- `docs/ARCHITECTURE.md` - technical claims must match the documented architecture.
- `docs/PROJECT_STATE.md` - current implementation status.
