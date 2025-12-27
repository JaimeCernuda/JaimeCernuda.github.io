import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../public/content/blog');
const PUBLIC_DIR = path.join(__dirname, '../public');
const SITE_URL = 'https://jcernuda.com';

async function generateRSS() {
    console.log('Generating RSS feed...');

    const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'));

    const posts = files.map(file => {
        const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
        const { data } = matter(content);
        const slug = file.replace('.md', '');

        return {
            title: data.title,
            description: data.summary,
            date: new Date(data.date),
            link: `${SITE_URL}/blog/${slug}`,
            guid: `${SITE_URL}/blog/${slug}`
        };
    });

    // Sort by date descending
    posts.sort((a, b) => b.date - a.date);

    const rssItems = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${post.link}</link>
      <guid>${post.guid}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${post.date.toUTCString()}</pubDate>
    </item>`).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Jaime Cernuda</title>
    <link>${SITE_URL}</link>
    <description>Research on High-Performance Computing, Distributed Systems, and AI</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

    fs.writeFileSync(path.join(PUBLIC_DIR, 'rss.xml'), rss);
    console.log(`RSS feed generated with ${posts.length} posts at ${path.join(PUBLIC_DIR, 'rss.xml')}`);
}

generateRSS();
