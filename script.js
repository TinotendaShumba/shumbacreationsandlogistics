// Main site JavaScript (externalized from index.html)
// Handles mobile nav toggle, smooth scrolling, button hover effects, fake form submission for demo, and scroll animations.

document.addEventListener('DOMContentLoaded', () => {
  // ===== Mobile Nav Toggle =====
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');

  // Helper to close nav
  function closeMobileNav() {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('nav-open');
  }

  if (navToggle && siteNav) {
    // Ensure aria-controls matches the nav id when present
    const controls = navToggle.getAttribute('aria-controls');
    if (controls) {
      const el = document.getElementById(controls);
      if (el && el !== siteNav) {
        // nothing, keep siteNav reference as primary
      }
    }

    // Use a single toggle function and pointer events for better touch reliability
    function toggleMobileNav() {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMobileNav();
      } else {
        navToggle.setAttribute('aria-expanded', 'true');
        siteNav.classList.add('nav-open');
      }
    }

    // Prefer pointerup for broad device support; fall back to touchend and click
    if (window.PointerEvent) {
      navToggle.addEventListener('pointerup', (ev) => {
        // ignore non-primary buttons
        if (ev.button && ev.button !== 0) return;
        ev.preventDefault();
        toggleMobileNav();
      });
    } else {
      // older browsers / devices
      navToggle.addEventListener('touchend', (ev) => { ev.preventDefault(); toggleMobileNav(); }, { passive: false });
      navToggle.addEventListener('click', (ev) => { ev.preventDefault(); toggleMobileNav(); });
    }

    // Close when clicking outside the nav on mobile
    document.addEventListener('click', (ev) => {
      const target = ev.target;
      if (!siteNav.classList.contains('nav-open')) return;
      if (target === navToggle || siteNav.contains(target) ) return;
      closeMobileNav();
    });

    // Close with Escape key
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') closeMobileNav();
    });
  }

  // ===== Smooth Scrolling =====
  document.querySelectorAll('[data-scroll]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const targetId = href.substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Close mobile nav after clicking a link
        if (siteNav && siteNav.classList.contains('nav-open')) {
          siteNav.classList.remove('nav-open');
          if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // ===== Button Hover Animation (pure CSS preferred, this is gentle enhancement) =====
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.05)');
    btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
  });

  // ===== Real Form Submission (Formspree or mailto fallback) =====
  // To make the form actually send messages, set FORM_ENDPOINT to your Formspree endpoint
  // e.g. const FORM_ENDPOINT = 'https://formspree.io/f/your-form-id';
  const FORM_ENDPOINT = '';
  const form = document.querySelector('.contact-form');

  function createAlertElement() {
      let el = form.querySelector('.form-alert');
      if (!el) {
        el = document.createElement('div');
        el.className = 'form-alert';
        // structure: <div class="form-alert"><div class="alert-message"></div><div class="alert-actions"></div></div>
        const msg = document.createElement('div');
        msg.className = 'alert-message';
        const actions = document.createElement('div');
        actions.className = 'alert-actions';
        el.appendChild(msg);
        el.appendChild(actions);
        form.prepend(el);
      }
      return el;
  }

  function showAlert(message, type = 'info') {
      const el = createAlertElement();
      const msg = el.querySelector('.alert-message');
      const actions = el.querySelector('.alert-actions');
      // clear previous actions
      actions.innerHTML = '';
      msg.textContent = message;
      el.dataset.type = type;
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'space-between';
      el.style.gap = '12px';
      el.style.padding = '12px';
      el.style.borderRadius = '8px';
      if (type === 'success') {
        el.style.background = '#d1fae5';
        el.style.color = '#065f46';
      } else if (type === 'error') {
        el.style.background = '#fee2e2';
        el.style.color = '#991b1b';
      } else {
        el.style.background = '#fff7ed';
        el.style.color = '#92400e';
      }
  }

    function addAlertAction(label, cb, kind = 'primary') {
      const el = createAlertElement();
      const actions = el.querySelector('.alert-actions');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn';
      if (kind === 'primary') btn.classList.add('btn-primary');
      else btn.classList.add('btn-outline');
      btn.textContent = label;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        cb();
      });
      actions.appendChild(btn);
      return btn;
    }

  function createMailto(name, email, message) {
    const to = 'shumbacreations@outlook.com';
    const subject = encodeURIComponent('Website inquiry from ' + name + ' (' + email + ')');
    const body = encodeURIComponent(message + '\n\n--\nName: ' + name + '\nEmail: ' + email);
    return `mailto:${to}?subject=${subject}&body=${body}`;
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const msg = form.querySelector('[name="message"]').value.trim();

      if (!name || !email || !msg) {
        showAlert('Please complete all required fields.', 'error');
        return;
      }

      showAlert('Sending message — please wait...', 'info');

      // If a FORM_ENDPOINT is configured, send via fetch
      if (FORM_ENDPOINT) {
        try {
          const res = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message: msg })
          });
          if (res.ok) {
            showAlert('Thanks! Your message has been sent.', 'success');
            form.reset();
          } else {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Send failed');
          }
        } catch (err) {
          console.error('Form send failed:', err);
          showAlert('Send failed. Opening your email client as a fallback.', 'error');
          // fallback to mailto after a short delay
          setTimeout(() => {
            window.location.href = createMailto(name, email, msg);
          }, 700);
        }
      } else {
        // No endpoint configured — fallback to opening user's email client
        window.location.href = createMailto(name, email, msg);
      }
    });
  }

  // ===== Plan selection from Price List =====
  document.querySelectorAll('.select-plan').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const plan = btn.dataset.plan || btn.textContent.trim();
      // Prefill contact form
      const planInput = document.querySelector('.contact-form input[name="plan"]');
      const messageField = document.querySelector('.contact-form textarea[name="message"]');
      const nameField = document.querySelector('.contact-form input[name="name"]');
      if (planInput) planInput.value = plan;
      if (messageField) messageField.value = `I am interested in: ${plan}\n\nPlease provide a quote and next steps.`;

      // Scroll to and focus the form
      const contactSection = document.getElementById('contact');
      if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (nameField) {
        setTimeout(() => nameField.focus(), 600);
      }

      // Show a small inline alert if form exists
      if (form) {
        showAlert(`Prefilled the contact form for: ${plan}`, 'info');
        // Provide an inline action so user can edit details first
        // Send now should validate that name & email are present first
        const sendBtn = addAlertAction('Send now', () => {
          const nameVal = form.querySelector('[name="name"]').value.trim();
          const emailVal = form.querySelector('[name="email"]').value.trim();
          let ok = true;
          // simple validation
          if (!nameVal) {
            const nf = form.querySelector('[name="name"]'); nf.classList.add('input-error'); nf.focus(); ok = false;
          }
          if (!emailVal) {
            const ef = form.querySelector('[name="email"]'); ef.classList.add('input-error'); if (ok) ef.focus(); ok = false;
          }
          if (!ok) {
            showAlert('Please provide your name and email before sending.', 'error');
            return;
          }
          // all good, submit
          const submitBtn = form.querySelector('[type="submit"]');
          if (submitBtn) submitBtn.click();
          else if (form.requestSubmit) form.requestSubmit();
        }, 'primary');

        addAlertAction('Edit details', () => {
          const ael = createAlertElement();
          ael.querySelector('.alert-actions').innerHTML = '';
          showAlert('You can edit the form now, then press Send.', 'info');
        }, 'outline');

        // Also add quick Whatsapp chat action that includes plan info
        addAlertAction('Chat on WhatsApp', () => {
          const planText = plan;
          const wa = `https://wa.me/8613779964069?text=${encodeURIComponent('Hi, I am interested in: ' + planText)}`;
          window.open(wa, '_blank', 'noopener');
        }, 'outline');
      }
    });
  });

  // ===== Scroll Animations =====
  const sections = document.querySelectorAll('.section, .hero');
  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
      });
    }, { threshold: 0.12 });
    sections.forEach(s => observer.observe(s));
  } else {
    // Fallback: simply show all
    sections.forEach(s => s.classList.add('in-view'));
  }
});
