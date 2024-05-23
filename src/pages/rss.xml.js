import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import ContentWrapper from '../components/ContentWrapper.astro'
import sanitizeHTML from 'sanitize-html'

const container = await AstroContainer.create({
  renderers: [
    {
      name: '@astrojs/mdx',
      serverEntrypoint: 'astro/jsx/server.js',
    },
    // you may have to add additional renderers if you use UI framework components in your blog
  ],
})

export async function GET(context) {
	const posts = await getCollection('blog')
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: await Promise.all(
			posts.map(async post => {
				let content = (await container.renderToString(ContentWrapper, {
					params: { slug: post.slug },
				}))
        content = sanitizeHTML(content, {
          allowedTags: sanitizeHTML.defaults.allowedTags.concat(['img'])
        })
				return {
					...post.data,
					link: `/blog/${post.slug}/`,
					content,
				}
			})
		),
	})
}
