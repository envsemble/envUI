// The contrast spec's page: envUI's stylesheet and nothing else, so tokens resolve exactly as the
// library ships them, without a fixture's own styles. The spec adds its theme boundaries and probes.
import '@envsemble/envui/styles.css';

document.body.dataset.stylesReady = '';
