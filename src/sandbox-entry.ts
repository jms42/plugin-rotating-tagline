import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";

async function getCurrentTagline(ctx: PluginContext): Promise<string | null> {
	const raw = (await ctx.kv.get<string>("settings:taglines")) ?? "";
	const mode = (await ctx.kv.get<string>("settings:mode")) ?? "random";

	const taglines = raw
		.split("\n")
		.map((t) => t.trim())
		.filter(Boolean);

	if (taglines.length === 0) return null;

	if (mode === "sequential") {
		const index = (await ctx.kv.get<number>("state:currentIndex")) ?? 0;
		const tagline = taglines[index % taglines.length];
		await ctx.kv.set("state:currentIndex", (index + 1) % taglines.length);
		return tagline;
	}

	return taglines[Math.floor(Math.random() * taglines.length)];
}

export default definePlugin({
	admin: {
		settingsSchema: {
			taglines: {
				type: "string",
				label: "Taglines",
				description: "One tagline per line. These are cycled on each page load.",
				multiline: true,
				default: "",
			},
			mode: {
				type: "select",
				label: "Rotation Mode",
				options: [
					{ value: "random", label: "Random" },
					{ value: "sequential", label: "Sequential (cycles in order)" },
				],
				default: "random",
			},
		},
	},

	hooks: {
		"plugin:install": {
			handler: async (_event, ctx) => {
				await ctx.kv.set("settings:taglines", "");
				await ctx.kv.set("settings:mode", "random");
				await ctx.kv.set("state:currentIndex", 0);
			},
		},

		"page:metadata": {
			handler: async (_event, ctx) => {
				const tagline = await getCurrentTagline(ctx);
				if (!tagline) return null;
				return [{ kind: "meta" as const, name: "tagline", content: tagline }];
			},
		},

		"page:fragments": {
			handler: async (_event, ctx) => {
				const tagline = await getCurrentTagline(ctx);
				if (!tagline) return null;
				return [
					{
						kind: "inline-script" as const,
						placement: "head" as const,
						code: `window.EMDASH_TAGLINE = ${JSON.stringify(tagline)};`,
					},
				];
			},
		},
	},

	routes: {
		admin: {
			handler: async (_routeCtx, _ctx) => {
				return { blocks: [] };
			},
		},

		current: {
			public: true,
			handler: async (_routeCtx, ctx) => {
				const tagline = await getCurrentTagline(ctx);
				return { tagline };
			},
		},
	},
});
