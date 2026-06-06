// src/controllers/loginController.js
// Behaviour for the login form. Implements the required UX:
//  - disable the submit button while the request is in flight
//  - on ANY error, fully reset the form and return focus to the email field
//  - on success, persist the session (in authService) and go to the dashboard.
import { login } from "@/services/authService.js";
import { isValidEmail, isValidPassword } from "@/utils/validators.js";
import { navigateTo } from "@/router/router.js";
import { showToast } from "@/utils/toast.js";

// Reset the whole form and put the cursor back on the email field. Shared by
// validation failures and authentication failures so behaviour is consistent.
function resetForm(form) {
  form.reset();
  form.querySelector("#email").focus();
}

// Basic client-side validation before hitting the API.
function getValidationError(email, password) {
  if (!isValidEmail(email)) return "Please enter a valid email address";
  if (!isValidPassword(password)) return "Password must have 6+ chars, letters and numbers";
  return null;
}

// Attempt authentication and route on success.
async function attemptLogin(email, password) {
  const session = await login(email, password);
  showToast(`Welcome, ${session.name}`, "success");
  navigateTo("/dashboard");
}

// Wire up the submit handler.
export function initLogin() {
  const form = document.querySelector("#loginForm");
  const button = document.querySelector("#loginBtn");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = form.email.value;
    const password = form.password.value;

    const validationError = getValidationError(email, password);
    if (validationError) {
      showToast(validationError, "error");
      resetForm(form);
      return;
    }

    button.disabled = true; // prevent double submits while awaiting the API
    try {
      await attemptLogin(email, password);
    } catch {
      showToast("Invalid credentials", "error");
      resetForm(form); // full reset + focus back on email on failure
      button.disabled = false;
    }
  });

  form.querySelector("#email").focus();
}
