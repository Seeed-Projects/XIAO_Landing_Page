# ESP flasher legacy reference

`esp-flasher.legacy.js` and `esp-flasher.legacy.module.css` preserve the complete
flasher implementation immediately before the simplified ESP / HA entry and
Step 1–3 workflow redesign. They are reference-only and are not imported by the
application.

To restore this version, copy the two legacy files over `../esp-flasher.js` and
`../esp-flasher.module.css`, then remove the `.legacy` suffix from the CSS import
inside the restored component if necessary.
