# Compliance Roles & Ownership (GDPR)

> Status: **scaffold — names TBD** · Last updated: 2026-06-23
> This register fills the "contact" fields in the Privacy Policy, RoPA, sub-processor page, and every DPA. **Launch-blocking** until the TBDs are filled. Not legal advice — confirm with privacy counsel.

## Decisions on record
- **Operating entity is established OUTSIDE the EU** (user, 2026-06-23) → **Art. 27 EU Representative is required** (processing of EU residents is regular + large-scale, so the Art. 27(2) exemption does not apply).
- **DPO appointed internally** (user, 2026-06-23) → location-independent; allowed.
- ⚠️ **The EU Representative must be located in an EU member state** — it cannot be the internal DPO unless that person is in the EU. If no EU-based staff exist, outsource this role only.

## Role register

| Role | Required? | Holder | Email | Location | Status |
|---|---|---|---|---|---|
| **Privacy contact / owner** | Yes (always) | _TBD — name_ | `privacy@<domain>` | any | ☐ to fill |
| **Data Protection Officer (DPO)** | Likely optional; appointed voluntarily/internally | _TBD — internal name_ | `dpo@<domain>` (can alias to privacy@) | any | ☐ to fill |
| **EU Representative (Art. 27)** | **Yes — entity is non-EU** | _TBD — EU-based person or service_ | _TBD_ | **EU member state** | ☐ to fill (outsource if no EU staff) |
| **Operating legal entity** | Yes | **FX Unlock** _(registered address TBD)_ | — | _TBD — country_ | ☐ partial |
| **Lead supervisory authority** | Determined by EU Rep location | _derive after EU Rep is set_ | — | EU member state | ☐ derive |

## Fields I need from you to unblock the artifacts
1. **Privacy owner:** name + title (a member of the FX Unlock team) → goes in Privacy Policy, RoPA, DPAs.
2. **DPO:** same person as the privacy owner, or someone else? (name)
3. **EU Representative:** do you have an EU-based person/group entity, or should I scope outsourcing it (Prighter / DataRep / VeraSafe)?
4. **Legal entity:** **FX Unlock** — still need registered address + country of incorporation.

## Recommended vendors (EU Representative + optional DPO-as-a-service)
- **Prighter** (prighter.com) — EU/UK/CH representation + DPO; per-jurisdiction address.
- **DataRep** (datarep.com) — EU representative with member-state address.
- **VeraSafe** — EU rep + DPO-as-a-service + privacy counsel.
- **DataGuard** — DPO-as-a-service (if you later want the DPO outsourced too).

## Next artifacts (this folder)
- [`sub-processors.md`](sub-processors.md) — public sub-processor list (pre-filled). ✅
- `ropa.md` — Records of Processing Activities — _to generate next; needs legal-basis review per activity._
- `dpa-tracker.md` — signed-DPA status per processor — _to generate next._
