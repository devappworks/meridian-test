export default function () {
	return {
		scrollBehavior(to, from, savedPosition) {
			if (savedPosition) return savedPosition
			return { top: 0 }
		}
	}
}
