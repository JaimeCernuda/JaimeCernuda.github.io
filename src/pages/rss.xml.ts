import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
  return rss({
    title: 'Jaime Cernuda',
    description: 'Research on High-Performance Computing, Distributed Systems, and AI',
    site: context.site ?? 'https://jcernuda.com',
    trailingSlash: false,
    customData: '<language>en-us</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: `/blog/${post.id}`,
    })),
  });
}
