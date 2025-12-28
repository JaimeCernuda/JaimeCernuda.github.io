import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const CONTENT_DIR = path.join(PUBLIC_DIR, 'content');
const SITE_URL = 'https://jcernuda.com';

const STATIC_ROUTES = [
    '/',
    '/cv',
    '/blog',
    '/projects',
    '/publications'
];

function getDynamicRoutes(folderName, routePrefix) {
    const dirPath = path.join(CONTENT_DIR, folderName);
    if (!fs.existsSync(dirPath)) return [];

    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));
    return files.map(file => `${routePrefix}/${file.replace('.md', '')}`);
}

async function generateSitemap() {
    console.log('Generating sitemap.xml...');

    const blogRoutes = getDynamicRoutes('blog', '/blog');
    const projectRoutes = getDynamicRoutes('projects', '/projects');
    const publicationRoutes = getDynamicRoutes('publications', '/publications');

    const allRoutes = [
        ...STATIC_ROUTES,
        ...blogRoutes,
        ...projectRoutes,
        ...publicationRoutes
    ];

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `    <url>
        <loc>${SITE_URL}${route}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${route === '/' ? '1.0' : '0.8'}</priority>
    </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapContent);
    console.log(`Sitemap generated with ${allRoutes.length} URLs at ${path.join(PUBLIC_DIR, 'sitemap.xml')}`);
}

generateSitemap();
