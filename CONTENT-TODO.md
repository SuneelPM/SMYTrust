# Content to supply before launch

Everything on the site today is taken from the existing smyservices.org. Nothing has been
invented. The items below are gaps where the current site has no source content — each one is
marked on the page with a dashed blue "Content needed" box so it cannot ship unnoticed.

Search the codebase for `placeholder` or `CONTENT-TODO` to find them all.

---

## 1. Contact form delivery — required

**Page:** `/contact/` · **File:** `src/pages/contact.astro`

The form currently falls back to opening the visitor's mail client. To have submissions
emailed to you instead:

1. Go to <https://web3forms.com> and enter `info@smyservices.org`. It is free.
2. Copy the access key they email you.
3. Create a file named `.env` in the project root containing:
   ```
   PUBLIC_WEB3FORMS_KEY=your-key-here
   ```
4. Run `npm run build` again.

The setup notice on the page disappears automatically once the key is present.

---

## 2. Online payments — optional

**Page:** `/donate/` · **File:** `src/pages/donate.astro`

Bank transfer details are live and correct. To also accept cards, UPI and net banking:

- Create a Razorpay or Instamojo account and generate a **payment link**.
- Send the link over and it gets wired to the "Donate now" buttons.
- No server is needed — the payment provider hosts the checkout page.

---

## 3. Activity write-ups — recommended

**Page:** `/activities/` · **File:** `src/pages/activities.astro`

The source site publishes 15 activity photos with no titles or dates. Supply for each activity:

| Needed | Example |
| --- | --- |
| Title | Flood relief distribution, Gajuwaka |
| Date | 5 February 2026 |
| One-line description | 400 food kits distributed across three wards. |
| Which photos belong to it | IMG_0317, IMG_0318, IMG_0324 |

The page then becomes a proper activity log instead of a photo set.

---

## 4. Additional certificates — recommended for CSR

**Page:** `/certificate/` · **File:** `src/pages/certificate.astro` and `src/data/site.ts`

Three documents are published. Corporate donors doing due diligence usually also ask for:

- 12A registration certificate
- 80G registration certificate
- Audited accounts for the most recent financial year
- FCRA status letter, if the trust holds one

Drop the image or PDF into `public/images/` and add an entry to the `certificates` array in
`src/data/site.ts`.

---

## 5. Social media links — required

**File:** `src/data/site.ts`, the `social` array

The original site displays Facebook, X, Instagram and YouTube icons but never links
them to real profiles. Those placeholder links have been **removed** rather than shipped:
a link to `https://facebook.com/` looks like the charity's page to a donor but opens
Facebook's front door instead.

Each entry now has `href: null`. The icon still shows as a **dimmed, non-clickable
placeholder** with the tooltip "link to be added", so the layout is final and the gap is
visible. Set a real profile URL and that icon becomes a live link automatically, in the
footer and on the contact page:

```ts
{ name: 'Facebook', href: 'https://facebook.com/your-page-name', icon: 'facebook' },
```

Delete any platform the organisation does not use. While every entry is still `null`, a
"Social profiles coming soon." note appears under the icons; it disappears as soon as one
real URL is set.

---

## 6. Office hours — please confirm

**Page:** `/contact/` · **File:** `src/pages/contact.astro`

Currently states "Monday – Saturday, 10:00 – 18:00 IST" with a visible note asking for
confirmation. Tell us the real hours and the note is removed.

---

## 7. Statistics — please confirm

**File:** `src/data/site.ts`, the `stats` array

These four figures are carried over from the existing site as-is:

- 2,500+ happy children
- 270+ volunteers
- 3,150+ products & gifts
- 8,700+ worldwide donors

They are prominent on the homepage and on the About page, and CSR partners may ask you to
evidence them. Confirm they are current and defensible, or send updated numbers.

The "12+ years serving Visakhapatnam" badge on the homepage and About page is an estimate —
confirm the actual founding year.

---

## 8. Things deliberately NOT built

Testimonials and a news/blog section were **not** created. Both would have required inventing
quotes from named beneficiaries and donors, and dated news stories about events that may not
have happened. For a registered trust that publishes a CSR number and is subject to corporate
due diligence, fabricated testimonials are a real liability.

If you want either section, send real material and it gets built:

- **Testimonials:** a real quote, the person's name, their role or village, and their consent
  to publish it.
- **News:** a title, date, two or three sentences, and a photo per item.

---

## 9. Trustee & Leadership members — required

**Pages:** `/` and `/about/` · **Files:** `src/data/site.ts`, `src/pages/index.astro`, `src/pages/about.astro`

The previous trustee member list has been removed per organisational request. A visible placeholder ("Trustee details in progress") is rendered on both the homepage and the About page until the updated list of trustees is supplied.

Supply for each trustee member:
- Full name
- Role / designation (e.g., President, Secretary, Treasurer, Trustee)
- Portrait photo (placed in `public/images/`)

Then add each member to the `team` array in `src/data/site.ts`.

---

## 10. Gallery photographs — in progress

**Pages:** `/gallery/` and `/` · **Files:** `src/pages/gallery.astro`, `src/data/media.ts`

All previous gallery photos have been cleared per request and archived. A visible placeholder ("Gallery update in progress") is rendered on the Gallery page and the homepage until new photographs are supplied.

To add new photographs:
1. Drop image files into `public/images/`.
2. Add entries to the `gallery` array in `src/data/media.ts` with the file path and descriptive `alt` text.
3. Run `npm run build` to generate responsive WebP variants and verify the site.

