/* ═══════════════════════════════════════════════════════════
   IAN KENYON — forms.js
   Footer contact form — Formspree submission
   (Feedback forms live in project pages; handled in project.js)
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Footer contact form ───────────────────────────────────
  const form    = document.getElementById('footer-contact-form');
  const success = document.getElementById('footer-success');
  const error   = document.getElementById('footer-error');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.querySelector('input[type="email"]').value.trim();

    // Basic validation
    if (!email || !email.includes('@')) {
      showError('Please enter a valid email address.');
      return;
    }

    // Disable submit while in flight
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (response.ok) {
        showSuccess();
        form.reset();
      } else {
        const data = await response.json().catch(() => ({}));
        const msg = data.errors
          ? data.errors.map(e => e.message).join(', ')
          : 'Something went wrong. Please try again.';
        showError(msg);
      }
    } catch (err) {
      showError('Could not send. Please check your connection.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send';
    }
  });

  function showSuccess() {
    if (success) { success.hidden = false; }
    if (error)   { error.hidden = true; }
  }

  function showError(msg) {
    if (error) {
      error.hidden = false;
      error.textContent = msg;
    }
    if (success) { success.hidden = true; }
  }

})();
