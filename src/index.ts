import type { PluginDescriptor } from "emdash";

export function rotatingTaglinePlugin(): PluginDescriptor {
	return {
		id: "rotating-tagline",
		version: "0.1.0",
		format: "standard",
		entrypoint: "plugin-rotating-tagline/sandbox",
		options: {},
	};
}
