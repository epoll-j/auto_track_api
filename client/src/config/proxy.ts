export const proxy = {
	"/dev/": {
		target: "http://127.0.0.1:8001",
		changeOrigin: true,
		rewrite: (path: string) => path.replace(/^\/dev/, "")
	},

	"/prod/": {
		target: "https://api.iflow.mobi",
		// target: "http://127.0.0.1:8001",
		changeOrigin: true,
		rewrite: (path: string) => path.replace(/^\/prod/, "")
	}
};
