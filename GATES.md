# Gates: SMYTrust remaining launch work

OWNS: public/**, src/data/site.ts, src/components/Footer.astro, src/pages/contact.astro, scripts/gates/**, CONTENT-TODO.md

Scope: complete every remaining item that does not require information only the organisation holds, and record the rest as explicit handoffs.

- [x] G1: the built site serves a robots.txt that allows crawling and points at the sitemap
  CHECK: node scripts/gates/robots.mjs
  EXPECT: ROBOTS_OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=4c6221b3d83d8f26b9f96b6bd38cac097b40c9ba1e63bcee0a8d8c99798c4f18; exit=0; EXPECT=matched; output-sha256=7a787b94d23a6e62a9f56754a6e4680a2201ed269ab870ded32a6262019b2369; output-bytes=10; shell=C:\Windows\system32\cmd.exe; cwd=C:\workspace\SMYTrust; path=fe351eaf25b9/44 entries

- [x] G2: the built site serves a valid multi-size favicon.ico
  CHECK: node scripts/gates/favicon.mjs
  EXPECT: FAVICON_OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=c8553c0444e4af14b5aa92a87b7831f3d8f8b50155d1114596f912a70b15b330; exit=0; EXPECT=matched; output-sha256=053824e2acfa4dcfe803dcb5ed223eeb2af57f878fe24285e289e9193ac7df36; output-bytes=29; shell=C:\Windows\system32\cmd.exe; cwd=C:\workspace\SMYTrust; path=fe351eaf25b9/44 entries

- [x] G3: every image shipped in the build is referenced by at least one page
  CHECK: node scripts/gates/unused-images.mjs
  EXPECT: UNUSED_IMAGES_OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=e6e074091a22f7ebd7e7c3e1420b0216c7f672775989db5840e6563c1be86849; exit=0; EXPECT=matched; output-sha256=69aecd58ddec2b92f8e4bc2a1a788bd041d75293f78c194191b4b532dcc35995; output-bytes=88; shell=C:\Windows\system32\cmd.exe; cwd=C:\workspace\SMYTrust; path=fe351eaf25b9/44 entries

- [x] G4: no social link in the built site points at a bare platform homepage
  CHECK: node scripts/gates/social-links.mjs
  EXPECT: SOCIAL_LINKS_OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=228c6a46790f46cff99aa8af833454f23308c6bef7bd1b75cbfb9efc489214d1; exit=0; EXPECT=matched; output-sha256=908006f16741c3a4d3cfd045de6297f88dd655479d162850629544427225efc5; output-bytes=59; shell=C:\Windows\system32\cmd.exe; cwd=C:\workspace\SMYTrust; path=fe351eaf25b9/44 entries

- [x] G5: the full build pipeline completes with zero verification errors
  CHECK: npm run build
  EXPECT: /VERIFY OK — \d+ pages, \d+ routes, 0 errors/
  EVIDENCE: automatic-evidence=v1; definition-sha256=aad1af76f8923d4f2badcf02330d5fa2e2838d7a21aa8b387f22e4f25e4b715b; exit=0; EXPECT=matched; output-sha256=d23e54bc6cdcc11a3b74a842fa6cfa99402985d737f8c04a456cd9bd9d560b2a; output-bytes=2512; shell=C:\Windows\system32\cmd.exe; cwd=C:\workspace\SMYTrust; path=fe351eaf25b9/44 entries

- [x] G6: every route renders from the production build with no horizontal overflow and all deferred content reachable
  CHECK: node scripts/gates/visual.mjs
  EXPECT: VISUAL_OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=61dd4353f5355e069ef47a2fd29b332c3b3e624460d248c89a5c8de927eebd78; exit=0; EXPECT=matched; output-sha256=5523ad0a5ad01abdf59300e50c9623ffafbca179f20afaf7bcf2744b60a24bc5; output-bytes=49; shell=C:\Windows\system32\cmd.exe; cwd=C:\workspace\SMYTrust; path=fe351eaf25b9/44 entries

- [x] G7: CONTENT-TODO.md lists exactly the items still blocked on the organisation
  CHECK: node scripts/gates/content-todo.mjs
  EXPECT: CONTENT_TODO_OK
  EVIDENCE: automatic-evidence=v1; definition-sha256=0b07805837044da5388797ab78e8b84f530e65063107831288829f05668cc354; exit=0; EXPECT=matched; output-sha256=ad45c0c007530f0df2992e0253a86cbed1f487813ad29f73d514cbaf2bb5c7cb; output-bytes=89; shell=C:\Windows\system32\cmd.exe; cwd=C:\workspace\SMYTrust; path=fe351eaf25b9/44 entries

- [ ] G15: no financial identifier appears in any git-tracked file or commit
  CHECK: node scripts/gates/no-secrets.mjs
  EXPECT: NO_SECRETS_OK
  EVIDENCE: pending

- [ ] G8: contact form delivery is live (Web3Forms key present and submissions reach info@smyservices.org)
  EVIDENCE: pending

- [ ] G9: real social media profile URLs are published
  EVIDENCE: pending

- [ ] G10: the four headline statistics and the founding year are confirmed by the organisation
  EVIDENCE: pending

- [ ] G11: activity write-ups (title, date, description per activity) are supplied
  EVIDENCE: pending

- [ ] G12: 12A / 80G certificates and audited accounts are supplied for the certificate page
  EVIDENCE: pending

- [ ] G13: online payment link (Razorpay/Instamojo) is created and wired
  EVIDENCE: pending

- [ ] G14: office hours are confirmed
  EVIDENCE: pending

ABANDON: G8 requires a Web3Forms account and secret key that only the organisation can create; site falls back to a mailto: form and shows a setup notice until PUBLIC_WEB3FORMS_KEY is set. Handoff: CONTENT-TODO.md item 1.
ABANDON: G9 requires the organisation's real profile URLs, which are not published anywhere in the source site; placeholder links have been removed rather than shipped as misleading links. Handoff: CONTENT-TODO.md item 5.
ABANDON: G10 requires the organisation to confirm figures carried over from smyservices.org; they cannot be derived from any artifact in this repository. Handoff: CONTENT-TODO.md item 7.
ABANDON: G11 requires activity names, dates and descriptions the source site never published. Handoff: CONTENT-TODO.md item 3.
ABANDON: G12 requires certificate documents the organisation has not provided. Handoff: CONTENT-TODO.md item 4.
ABANDON: G13 requires a payment-provider account only the organisation can open. Handoff: CONTENT-TODO.md item 2.
ABANDON: G14 requires the organisation to state its real opening hours. Handoff: CONTENT-TODO.md item 6.
