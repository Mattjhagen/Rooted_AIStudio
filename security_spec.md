# Security Specification for Rooted Daily

## Data Invariants
1. A **Highlight** must belong to the authenticated user (`userId == auth.uid`).
2. A **Note** must belong to the authenticated user (`userId == auth.uid`).
3. Users can only read their own highlights.
4. Users can read their own notes, and public notes from others.
5. `createdAt` must be set to `request.time` and immutable.
6. `userId` must be the current authenticated UID and immutable.

## The "Dirty Dozen" Payloads (Deny Cases)
1. Creating a highlight for another user's ID.
2. Updating someone else's note.
3. Increasing a highlight document with a 1MB junk string.
4. Changing the `userId` on a note update.
5. Setting a future `createdAt` timestamp.
6. Deleting another user's highlight.
7. Accessing private notes of another user.
8. Creating a note without a reference to a valid book.
9. Modifying `isPublic` on a note you don't own.
10. Creating a highlight with invalid verse numbers (e.g. non-integers).
11. Bypassing size limits on note text.
12. Reading the entire `users` collection.
