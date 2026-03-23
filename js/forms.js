/* ═══════════════════════════════════════════════════════════
   IAN KENYON — forms.js
   Handles all form submissions:
   - Footer contact form (all pages)
   - Project feedback forms (slipstream, youre-wild)
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  async function submitToFormspree(form, successEl, errorEl) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (response.ok) {
        if (successEl) successEl.hidden = false;
        if (errorEl)   errorEl.hidden = true;
        form.reset();
        if (typeof hcaptcha !== 'undefined') hcaptcha.reset();
      } else {
        const data = await response.json().catch(() => ({}));
        const msg = data.errors ? data.errors.map(e => e.message).join(', ') : 'Something went wrong. Please try again.';
        if (errorEl) { errorEl.hidden = false; errorEl.textContent = msg; }
        if (successEl) successEl.hidden = true;
      }
    } catch (err) {
      if (errorEl) { errorEl.hidden = false; errorEl.textContent = 'Could not send — please check your connection.'; }
      if (successEl) successEl.hidden = true;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  // Footer contact form
  const footerForm    = document.getElementById('footer-contact-form');
  const footerSuccess = document.getElementById('footer-success');
  const footerError   = document.getElementById('footer-error');

  if (footerForm) {
    footerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = footerForm.querySelector('input[type="email"]').value.trim();
      if (!email || !email.includes('@')) {
        if (footerError) { footerError.hidden = false; footerError.textContent = 'Please enter a valid email address.'; }
        return;
      }
      await submitToFormspree(footerForm, footerSuccess, footerError);
    });
  }

  // Project feedback forms
  [
    { formId: 'slipstream-feedback-form', successId: 'sl-success', errorId: 'sl-error' },
    { formId: 'yourewild-feedback-form',  successId: 'yw-success', errorId: 'yw-error' },
  ].forEach(({ formId, successId, errorId }) => {
    const form    = document.getElementById(formId);
    const success = document.getElementById(successId);
    const error   = document.getElementById(errorId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // 1. Content validation — must come before captcha check
      const hasRating = form.querySelector('input[name="rating"]:checked');
      const hasText   = Array.from(form.querySelectorAll('textarea')).some(t => t.value.trim().length > 0);
      if (!hasRating && !hasText) {
        if (error) { error.hidden = false; error.textContent = 'Please share at least a star rating or a comment before submitting.'; }
        return;
      }

      // 2. hCaptcha check — only runs if content is present
      // hCaptcha may be blocked (ad blockers, consent tools, corporate networks).
      // If absent we allow submission through — Formspree provides secondary spam protection.
      if (typeof hcaptcha !== 'undefined' && !hcaptcha.getResponse()) {
        if (error) { error.hidden = false; error.textContent = 'Please complete the captcha to confirm you\'re human.'; }
        return;
      }

      if (error) error.hidden = true;
      await submitToFormspree(form, success, error);
    });
  });

})();
