export default defineEventHandler(async (event) => {
	const { id } = event.context.params
	const config = useRuntimeConfig()
	// Call the correct backend endpoint and include Authorization when available
	const headers = {}
	if (config.public.API_KEY) headers.Authorization = config.public.API_KEY
	const data = await $fetch(`${config.public.BACKEND_URL}/getOneArticle/${id}`,
		{ headers }
	)
	// Unwrap to return the article object directly for the page to consume
	return data?.result?.article ?? data
})
