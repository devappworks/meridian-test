export default defineEventHandler(async (event) => {
	const { id } = event.context.params
	const config = useRuntimeConfig()
	const headers = {}
	// Prefer server-only apiKey if provided, else fall back to public
	if (config.API_KEY) headers.Authorization = config.API_KEY
	else if (config.public.API_KEY) headers.Authorization = config.public.API_KEY

	try {
		const response = await $fetch(`${config.public.BACKEND_URL}/getOneArticle/${id}`,
			{ headers }
		)
		const article = response?.result?.article
		if (!article || typeof article !== 'object') {
			throw createError({ statusCode: 404, statusMessage: 'Article not found' })
		}
		return article
	} catch (err) {
		if (isError(err) && err.statusCode) throw err
		throw createError({ statusCode: 500, statusMessage: 'Failed to fetch article' })
	}
})
