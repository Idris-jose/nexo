/**
 * Demo profile pictures (Unsplash licence, stored locally under /public/photos/people).
 * Looked up by id so existing demo state in localStorage picks them up without a migration.
 * Accounts created during the demo have no photo and fall back to the icon avatar.
 */
const PEOPLE = new Set([
  "u_alex", "u_john", "u_sarah", "u_thabo", "u_mia", "u_mike", "u_bongani", "u_sipho", "u_kagiso", "u_lerato",
  "u_naledi", "u_zanele", "u_tumi", "u_ayesha", "u_brandon", "u_grace", "u_maya", "u_pieter", "u_nandi",
]);

export const userPhoto = (id?: string) => (id && PEOPLE.has(id) ? `/photos/people/${id}.jpg` : undefined);
