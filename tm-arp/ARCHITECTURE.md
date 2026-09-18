# TM-ARP v1.0 Architecture Freeze
Status: FROZEN-CANDIDATE
Baseline: Text-Metrics v1.9.1 production verified.
Pilot candidate: v1.9.2, additive metadata only; measurement semantics unchanged.

State machine:
CREATED -> BASELINE_VERIFIED -> CHANGE_INTAKE -> DELTA_CLASSIFIED -> SPEC_CANDIDATE -> IMPLEMENTING -> TESTING -> CI_VERIFIED -> PREVIEW_VERIFYING -> RELEASE_ELIGIBLE -> AUTHORIZATION_REQUIRED -> PRODUCTION_DEPLOYING -> PRODUCTION_VERIFYING -> EVIDENCE_FINALIZING -> RELEASED.
Failure: any execution state -> FAILURE_JUDGED -> ROLLBACK_REQUIRED -> ROLLBACK_VERIFYING -> ROLLED_BACK or BLOCKED.

Invariants:
1. Missing evidence is UNVERIFIED.
2. Frozen fixtures cannot be rewritten by repair logic.
3. CI success is not production success.
4. Deployment identity must bind to source commit.
5. Production endpoint must be called.
6. Semantic/governance changes require authorization.
7. No silent promotion.
8. Rollback target is LAST_KNOWN_GOOD.
9. TM authority is measurement only.
10. Project/Library/Vercel evidence never proves native ChatGPT host registration.
