import { openRelay } from './client.mjs';

// Opening from this realm makes the relay inherit the iframe's navigation restrictions.
window.openPulseDiskRelay = openRelay;
