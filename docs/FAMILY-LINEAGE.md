# Family hierarchy & lineage linking

How church management connects households (`FAM###`), what **Lineage** shows, and how **optional linking when adding a family** works (implemented in backend + Add family form).

---

## 1. Concepts

### Public code vs internal id

| Field | Example | Purpose |
|--------|---------|---------|
| `family_code` | `FAM100` | Shown in UI, search, Lineage labels |
| `id` (UUID) | `8f3a…` | Primary key; **all links use UUIDs** |

Member records use `person.family_id` → current household UUID.

### Hierarchy columns on `cm_families`

| Column | Meaning |
|--------|---------|
| `parent_family_id` | **One step up** — UUID of parent household. `NULL` = no parent (a **root** in the tree). |
| `root_family_id` | **Top of the branch** — UUID of the root family for this tree (may equal `id` on a root row). |
| `head_of_family_id` | UUID of the **person** who is head — not the same as parent FAM. |

**Lineage tab** is built from `parent_family_id` (walk up) and children where `parent_family_id = this family` (walk down). See `cm_build_family_lineage` in `backend-php/lib/church-mgmt/person-profile.php`.

### Generation

- **`generation`** (API): count of `parent_family_id` steps to the top (see `cm_family_generation` in `family-code.php`).
- **`FAM###` number** is **not** generation — it is the next global sequence when the family was created.

---

## 2. How links are created (before & after)

### A. Add family (default, unchanged)

- New row: `parent_family_id = NULL`, `root_family_id = own id`.
- Standalone **root** until something links it.

### B. Move / split (son leaves home) — existing

- `POST /api/church-management/families/{id}/split`
- New family: `parent_family_id = original id`, `root_family_id = original’s root (or original id)`.
- Members moved; split history + life events recorded.

### C. **New: link when adding a family** — this document

On **Add family**, staff can optionally connect the new household to an existing **root** family (roots only: `parent_family_id IS NULL`).

Two modes (mutually exclusive):

| Mode | API field | Effect |
|------|-----------|--------|
| **Above root (ancestor)** | `linkAsParentOfRootFamilyId` | New family becomes **parent** of the selected root; whole branch’s `root_family_id` moves to the new family. |
| **Under root (branch)** | `linkUnderRootFamilyId` | New family’s `parent_family_id` = selected root; `root_family_id` = that tree’s root. Does **not** move people (unlike Move). |

Implementation: `backend-php/lib/church-mgmt/family-lineage-link.php`, called from `POST /families` after insert (inside the same DB transaction).

---

## 3. API reference

### List linkable roots

```
GET /api/church-management/families/roots
Authorization: Bearer <church-mgmt JWT>
```

**Response:**

```json
{
  "roots": [
    {
      "id": "<uuid>",
      "familyCode": "FAM100",
      "headName": "John Raj",
      "houseName": "Kallumkal",
      "label": "FAM100 — John Raj"
    }
  ]
}
```

Only families with `parent_family_id IS NULL` and not soft-deleted (limit 200, ordered by `family_code`).

### Create family with optional link

```
POST /api/church-management/families
```

Existing body (address, area, HOF fields, etc.) plus **at most one** of:

| Field | Type | When |
|--------|------|------|
| `linkAsParentOfRootFamilyId` | UUID string | New FAM is **above** this root |
| `linkUnderRootFamilyId` | UUID string | New FAM is **under** this root |

**Errors (400):**

- Both link fields set.
- Selected family is not a root (already has a parent).
- Link family to itself.

Link runs **after** the new family and HOF person are inserted, **before** transaction commit.

### Frontend client

- `familiesApi.getRootFamiliesForLineage()` → `GET …/families/roots`
- `CreateFamilyRequest` in `src/modules/church-management/api/types.ts` includes the two optional UUID fields.

---

## 4. UI (Add family)

**Location:** Families → **Add family** → `AddFamilyWithMembersForm`.

**Component:** `src/modules/church-management/components/FamilyLineageLinkFields.tsx`

**Flow:**

1. Optional checkbox: **Connect this new family to an existing root**.
2. Dropdown: roots from API (`label` = `FAM### — Head name`).
3. Radio:
   - **Above this root** → sends `linkAsParentOfRootFamilyId`.
   - **Under this root** → sends `linkUnderRootFamilyId`.
4. Validation: if checkbox on, a root must be selected.

Link block is hidden after the family is created in the same session (`familyLocked`).

---

## 5. Database behavior (examples)

### Example 1 — Ancestor above existing root (grandparents)

**Before:**

```
FAM100  parent=NULL, root=self
FAM200  parent=FAM100, root=FAM100   (son moved out)
```

**Action:** Add **FAM150** (grandparents’ house) with **Above** → select **FAM100**.

**After (conceptually):**

```
FAM150  parent=NULL, root=self          ← new top
FAM100  parent=FAM150, root=FAM150
FAM200  parent=FAM100, root=FAM150
```

**Lineage on FAM200:** path like `FAM150 → FAM100 → FAM200`.

**Backend steps:**

1. Insert FAM150 as usual (initially root=self).
2. `cm_link_new_family_as_ancestor_of_root(150, 100)`:
   - Set FAM100: `parent_family_id = 150`, `root_family_id = 150`.
   - Update all rows in that tree whose `root_family_id` pointed at the old tree root to `150`.

### Example 2 — Branch under root (no member move)

**Action:** Add **FAM300** with **Under** → select **FAM100**.

**After:**

```
FAM300  parent=FAM100, root=FAM100 (same as FAM100’s tree root)
```

FAM100 members stay on FAM100; FAM300 is an empty linked branch until you add members there.

---

## 6. What Lineage still does not do

- **Person-to-person** tree (`parent_person_id` exists in schema but is unused in app logic).
- Link an **existing** family to a root **after** create (only at **Add family** today).
- Link to a **non-root** family (dropdown is roots only by design).
- Replace **Move/split** for sons leaving with dues/member transfer — use **Move** for that.

For older relatives **without** a separate `FAM`, you can still add **Father/Mother** members on the original family.

---

## 7. Files touched (implementation)

| Area | Path |
|------|------|
| Link logic | `backend-php/lib/church-mgmt/family-lineage-link.php` |
| Loaded from | `backend-php/lib/church-mgmt/helpers.php` |
| Routes | `backend-php/api/church-management-families.php` (`GET …/roots`, link on `POST`) |
| Lineage display (unchanged) | `backend-php/lib/church-mgmt/person-profile.php` (`cm_build_family_lineage`) |
| UI widget | `ALL-Saint-s/src/modules/church-management/components/FamilyLineageLinkFields.tsx` |
| Add family form | `ALL-Saint-s/src/modules/church-management/components/AddFamilyWithMembersForm.tsx` |
| API types / client | `api/types.ts`, `api/families.ts` |

---

## 8. Staff checklist

| Goal | What to do |
|------|------------|
| Son new home + members moved | **Move** on member (not Add family link) |
| Grandparents’ **household** above current root | **Add family** → link **Above** → pick root `FAM` |
| Extra `FAM` under a root (no move) | **Add family** → link **Under** → pick root |
| Grandparents as **people only** | Add members on existing `FAM` (Father/Mother) — no link needed |
| See tree | Family → **Lineage** tab |

---

## 9. Deploy

1. Upload **backend-php** (includes `family-lineage-link.php` and updated `church-management-families.php`).
2. Build and deploy **ALL-Saint-s** frontend.
3. No new SQL migration required (uses existing `parent_family_id` / `root_family_id` columns).

---

## 10. Related docs

- General church mgmt setup: `docs/SETUP-CHURCH-MGMT.md`
- Integration overview: `docs/CHURCH_MANAGEMENT_INTEGRATION.md`
