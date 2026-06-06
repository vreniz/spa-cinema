// src/utils/validators.js
// Pure validation helpers based on regular expressions. They are side-effect
// free so they can be reused by any form and unit-tested in isolation.

// Standard, pragmatic email shape: something@something.tld
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password rule: at least 6 chars, containing both a letter and a number.
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

// True when the trimmed value matches the email pattern.
export function isValidEmail(value) {
  return EMAIL_REGEX.test(String(value).trim());
}

// True when the value satisfies the password complexity rule.
export function isValidPassword(value) {
  return PASSWORD_REGEX.test(String(value));
}

// True when a positive integer is provided (used for ticket counts).
export function isPositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
}
