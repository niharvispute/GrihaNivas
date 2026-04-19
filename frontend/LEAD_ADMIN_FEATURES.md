# Lead Admin — Notes + Status Undo

## What's New

Two new features for admin lead management in `/admin/leads`:

### 1. **Add Note Button** 

**Location**: Lead detail modal (click "View" → see notes section)

**How to use**:
1. Click the "View" button (eye icon) on any lead row
2. Scroll down in the modal to "Activity Notes" section
3. Type a note in the textarea (e.g., "Contacted - customer interested, following up next week")
4. Click "Add" button
5. Note appears immediately in the notes list with timestamp
6. Notes persist to database and survive page reload

**Features**:
- Multiple notes per lead (activity log)
- Each note shows timestamp (when added)
- Max 2000 characters per note
- Admin name tracked with each note (via `addedBy`)
- Notes auto-scroll on large activity histories

### 2. **Undo Status Button**

**Location**: Table rows (next to "→ next status" button)

**How to use**:
1. Look at any lead row that has a status of `contacted`, `qualified`, or `closed`
2. Click the undo (↩) button (appears as rotate-left icon)
3. Status immediately reverts to previous stage:
   - `closed` → `qualified`
   - `qualified` → `contacted`
   - `contacted` → `new`
4. Undo button **only appears** for non-`new` leads
5. Button shows loading spinner while reverting

**Features**:
- One-step revert only (cannot skip multiple steps)
- Backend validates to prevent jumping back (e.g., `closed` cannot go directly to `new`)
- Optimistic UI — local state updates immediately
- Works with lead detail modal (status updates there too)

---

## Technical Details

### Backend Changes

**File**: `backend/controllers/leadController.js`

**Change**: Modified `updateStatus` to allow backward transitions by exactly one step:

```javascript
const diff = STATUS_ORDER[newStatus] - STATUS_ORDER[lead.status];
if (diff < -1) {
  throw new AppError(`Can only revert one stage at a time...`, 400);
}
```

**What this allows**:
- ✅ `contacted` → `new` (backward 1 step)
- ✅ `qualified` → `contacted` (backward 1 step)
- ✅ `closed` → `qualified` (backward 1 step)
- ❌ `closed` → `contacted` (backward 2 steps — rejected)
- ❌ `closed` → `new` (backward 3 steps — rejected)

### Frontend Changes

**File**: `frontend/src/app/admin/leads/page.js`

**What was added**:
1. Import `addLeadNote` from leadService
2. State variables for notes UI:
   - `noteText` — textarea content
   - `addingNote` — loading state
   - `revertingId` — which lead is being reverted
3. `PREV_STATUS` mapping: `{ contacted: 'new', qualified: 'contacted', closed: 'qualified' }`
4. `handleAddNote()` — calls backend, updates local state
5. `handleRevertStatus()` — calls backend, updates local state
6. Undo button in table rows (amber-colored, shows sync icon on loading)
7. Notes section in lead detail modal with:
   - History list (scrollable, max 48px height)
   - Empty state message
   - Add note textarea + button

---

## Database Schema (Unchanged)

The `notes` sub-document already existed in the Lead model:

```javascript
notes: [
  {
    text: String,           // The note content
    addedBy: ObjectId,      // Reference to admin User
    addedAt: Date           // When the note was added
  }
]
```

---

## Service Functions (Already Existed)

**In `frontend/src/services/leadService.js`**:

```javascript
export const addLeadNote = async (leadId, text) => {
  // POST /api/leads/:id/notes with { text }
  // Returns: { text, addedBy, addedAt }
}
```

**In `backend/routes/leads.js`**:

```javascript
router.post('/:id/notes', protect, adminOnly, ..., leadController.addNote);
// POST /api/leads/:id/notes
// Body: { text: string (min 1, max 2000) }
// Response: { success, message, data: note }
```

---

## UI/UX Details

### Note Card Styling
- Amber background (`bg-amber-50`)
- Text in slate-700
- Timestamp in amber-500, uppercase, smaller font
- Rounded corners, border, padding

### Undo Button Styling
- Small square button (w-9 h-9)
- Amber hover state (`hover:text-amber-600 hover:bg-amber-50`)
- Undo icon that changes to sync on loading
- Disabled when:
  - Lead row is being updated (advance status)
  - Lead is being deleted
  - This specific lead is being reverted

### Notes List
- Scrollable area (max-h-48) if many notes
- "No notes yet" message if empty
- Each note shows full text + date

---

## Testing Checklist

- [ ] Open `/admin/leads`
- [ ] Click View on any lead → modal opens
- [ ] Type a note, click Add → note appears immediately
- [ ] Close and reopen modal → note still there
- [ ] Scroll notes list (add multiple notes to test scroll)
- [ ] Advance a lead `new` → `contacted` (→ button)
- [ ] Click undo (↩) button → status goes back to `new`
- [ ] Try reverting `new` → undo button should NOT appear
- [ ] Advance to `closed`, click undo twice quickly → should reject 2nd revert (can only do 1 at a time)
- [ ] View modal while lead is being reverted → status updates in modal too

---

## Error Handling

**Notes**:
- If add fails → "Failed to add note" alert
- Invalid text (empty) → button disabled, won't submit

**Status Revert**:
- If revert fails → "Failed to revert status" alert
- If trying to skip steps → backend rejects with message
- Button disabled during operation (shows sync spinner)

---

## Future Enhancements

Potential ideas (not implemented):

1. **Delete Note** — Remove a note (add X button on each note card)
2. **Edit Note** — Modify existing note
3. **Note Tags** — Tag notes with type (e.g., "follow-up", "proposal sent", "callback")
4. **Auto-revert** — Automatically revert if lead hasn't been contacted in X days
5. **Note Mentions** — @ mention other admins to notify them
6. **Bulk Operations** — Move multiple leads, add note to batch
7. **Note Templates** — Quick buttons for common notes ("Customer interested", "Send proposal", etc.)
