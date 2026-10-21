# Wireless protocol logos

| File | Mark | Source |
| --- | --- | --- |
| wifi.svg | Wi-Fi Alliance logo | https://commons.wikimedia.org/wiki/File:WiFi_Logo.svg |
| bluetooth.svg | Bluetooth mark (#0082FC) | Simple Icons `bluetooth`, from https://www.bluetooth.com/develop-with-bluetooth/marketing-branding |
| thread.svg | Thread Group wordmark | https://commons.wikimedia.org/wiki/File:Thread_Group_wordmark.svg |
| zigbee.svg | Zigbee mark (#EB0443) | Simple Icons `zigbee`, from https://csa-iot.org/all-solutions/zigbee |
| matter.svg | Matter logo | https://commons.wikimedia.org/wiki/File:Logo_of_Matter_connectivity_standard.svg |
| nfc.svg | NFC Forum N-Mark (#002E5F) | Simple Icons `nfc`, from https://nfc-forum.org/our-work/nfc-branding/n-mark/guidelines-and-brand-assets/ |

The selector inlines these original path geometries in
`src/app/products/wireless-protocols.mjs` with a white fill. Thread uses the
T-loop path; Matter uses the three-arrow subpaths; Wi-Fi keeps the full mark
with its original cutouts combined using even-odd fill. View boxes crop the
marks to their bounds while preserving their proportions.
