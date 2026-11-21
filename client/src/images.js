// Every jpg and png in src/assets, looked up by file name (the names used in shared/portfolio.json).
const files = import.meta.glob('./assets/*.{jpg,png}', { eager: true, query: '?url', import: 'default' });

export const img = (name) => (name ? files[`./assets/${name}`] : undefined);
