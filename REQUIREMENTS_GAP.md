# Requirements Gap Analysis

This document maps requested requirements to what is currently implemented in the codebase, what is partially supported, and what is missing.

## Contacts

### Implemented
- Contact fields include pronouns, address, city, postal code, website, Signal, phone, and social links.
  - `components/forms/contact.tsx`, `validations/contacts.ts`
- Contact cards and detail views show phone, Signal, address, and other core fields.
  - `components/table/contact-columns.tsx`, `app/teams/[teamId]/contacts/[id]/page.tsx`
- Profile attributes (custom key/value) on contacts (can represent “newbie/experienced” or other labels).
  - `validations/contacts.ts`, `components/forms/contact.tsx`
- Attribute key suggestions via dropdown/autofill (prevents some misspellings).
  - `components/forms/contact.tsx` (Combobox with `attributeKeyOptions`)
- Filter by state/address/postal code/city/country, distance from postal code, group membership, event roles, and profile attributes.
  - `components/forms/contact-list-filters-builder.tsx`, `types/index.ts` (`ContactFilter`)
- Distance filter (postal code + radius).
  - `components/forms/contact-list-filters-builder.tsx`, `validations/contacts.ts`
- Restricted internal notes per contact (visibility by submodule), useful for “events team only” notes.
  - `components/forms/contact-engagement.tsx`, `components/contact-engagement-history.tsx`
  - `constants/contact-submodules.ts`, `prisma/schema.prisma` (`ContactEngagement.restrictedToSubmodule`)

### Partially
- Attribute label dropdown exists, but custom values are allowed, so duplicates can still occur.
  - `components/forms/contact.tsx` (`allowCustomValue`)
- “Assign attribute/sub-role to activists such as newbie/experienced” -> achievable via profile attributes, but no dedicated field or UX for “role.”
  - `components/forms/contact.tsx`
- “Comments” on contact cards -> no dedicated comment field. You can use engagement NOTE entries or a custom profile attribute, but it is not shown on cards.
  - `components/table/contact-columns.tsx`, `components/forms/contact-engagement.tsx`
- Filter by languages, Crewmember, Department, first activist action -> not native fields, but can be supported if stored as profile attributes and filtered via attribute filters.
- Sorting while filtering: contact table supports column sorting, but no dedicated “sort within filters” control on filter UI.
  - `components/table/contact-columns.tsx`, `components/data-table.tsx`
- Preset attributes (fixed set of ~40) are not enforced; possible to pre-populate via attribute keys but not locked.

### Missing
- Automatic logging of emails sent to Zammad into engagements.
- Auto-create or auto-match contacts from Zammad emails or website forms.
  - Public event registration exists but does not create contacts: `app/api/public/events/registrations/route.ts`
- BCC email sending option in CRM.
- Assign an internal “contact owner” (team member responsible for a contact).
- Reduce roles/attributes to a single label system across contacts/lists/events (current model has both attributes + event roles).

## Lists

### Implemented
- Sorting lists (by updated/name/count).
  - `components/forms/contact-lists-manager.tsx`
- Export/download emails for a list (CSV).
  - `components/forms/contact-lists-manager.tsx`, `components/forms/contact-list-detail.tsx`
- Edit a contact from list view.
  - `components/forms/contact-list-detail.tsx`
- Smart lists auto-include contacts based on filters (including attributes).
  - `components/forms/contact-list-detail.tsx`, `services/contacts/index.ts`

### Missing
- Export lists with selectable columns (e.g., name + email + chosen attributes). Current export is emails-only.
- “Use selected contacts further” (e.g., mass email to a list) is not implemented.
## Events

### Implemented
- Event types (categorization) + manager.
  - `components/forms/event-types-manager.tsx`, `validations/event-types.ts`
- Event filters by state, date range, type.
  - `components/table/event-table.tsx`
- Event fields: online/offline, expected guests, remuneration, address/city/postal code/state/time, merch-needed, associated contacts.
  - `validations/events.ts`, `components/forms/event.tsx`
- Link existing contacts to events + assign roles.
  - `components/forms/event.tsx`, `components/forms/event-roles-manager.tsx`
- Public event listing/search/filter with pagination.
  - `app/public/[teamId]/events/page.tsx`, `components/public/public-events-explorer.tsx`, `app/api/public/events/[teamId]/route.ts`
- Add lists to events (attach contact lists for grouped outreach).
  - `components/forms/event.tsx`, `services/events/index.ts`, `prisma/schema.prisma`

### Partially
- Reporting use-cases (e.g., “x events in Baden-Wuerttemberg in Jan 2024”, “contact x participated in 8 events in 2025”). Data model supports event contacts and roles, but there is no reporting UI yet.
  - `app/teams/[teamId]/reports/page.tsx`

### Missing
- Filter by attributes when adding contacts to an event (search is name/email/phone only).
  - `components/forms/event.tsx`
- “Add a local group as activist” (non-contact entity) to events.
  - Events currently link contacts only.

## Communication

### Missing
- BCC emailing option.
- Zammad auto-logging / auto-matching contacts from emails or web forms.
- Direct email send flow from CRM to contacts (outside funding/organizations).

## Organizations

### Implemented
- Organizations as first-class CRM entities (not just funding).
  - `app/teams/[teamId]/organizations/*`, `services/organizations/index.ts`
- Link contact as contact person.
  - `prisma/schema.prisma` (`Organization.contactPersonId`), `components/forms/organization.tsx`
- Organization types with custom fields (vary by type) via `profileData`.
  - `components/forms/organization-types-manager.tsx`, `components/forms/organization.tsx`
  - `validations/organization-types.ts`, `validations/organizations.tsx`
- Organization engagement/cooperation history.
  - `components/organization-engagements.tsx`, `services/organization-engagements/index.ts`

## Smart Lists / Filtering Behavior

### Missing
- “Smart selection” is rule-based, not trainable/ML. There is no training or feedback loop.

## Users / Permissions

### Partially
- Groups and contact-field access exist, but no obvious fine-grained permissions for user management (e.g., restrict delete users).
  - `components/forms/groups-manager.tsx`, `services/contacts/index.ts`

### Needs Investigation
- “Can’t edit supervision group” and display size issues need reproduction to confirm if it’s permissions or a UI bug.

## Data Security

### Missing
- Attach NDA/CoC PDFs to contacts. There is no file relation on Contact.
  - `prisma/schema.prisma`

## Templates and Automation

### Partially
- Email templates exist in Team Settings (funding-related), but no separate ownership per sub-team/module.
  - `app/teams/[teamId]/settings/*`, `services/email-templates`

## Other

### Missing
- "Projects" entity with links to contacts/organizations.
- Attach documents to contacts.
  - Contacts have no file relation in `prisma/schema.prisma`

### Implemented (Org Files)
- Attach documents to organizations (tax certificate, articles of association, logo).
  - `components/forms/organization.tsx`, `types/index.ts` (`Organization.Files`)
