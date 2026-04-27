import { definePlugin } from "emdash";
import type { PluginContext } from "emdash";

async function settingsBlocks(ctx: PluginContext) {
	const taglines = (await ctx.kv.get<string>("settings:taglines")) ?? "";
	const mode = (await ctx.kv.get<string>("settings:mode")) ?? "random";
	return [
		{ type: "header", text: "Rotating Tagline Settings" },
		{
			type: "form",
			block_id: "settings",
			fields: [
				{
					type: "text_input",
					action_id: "taglines",
					label: "Taglines",
					placeholder: "One tagline per line",
					initial_value: taglines,
					multiline: true,
				},
				{
					type: "select",
					action_id: "mode",
					label: "Rotation Mode",
					options: [
						{ label: "Random", value: "random" },
						{ label: "Sequential (cycles in order)", value: "sequential" },
					],
					initial_value: mode,
				},
			],
			submit: { label: "Save", action_id: "save_settings" },
		},
	];
}

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
	hooks: {
		"plugin:install": {
			handler: async (_event: unknown, ctx: PluginContext) => {
				await ctx.kv.set("settings:taglines", "");
				await ctx.kv.set("settings:mode", "random");
				await ctx.kv.set("state:currentIndex", 0);
			},
		},

		"page:metadata": {
			handler: async (_event: unknown, ctx: PluginContext) => {
				const tagline = await getCurrentTagline(ctx);
				if (!tagline) return null;
				return [{ kind: "meta" as const, name: "tagline", content: tagline }];
			},
		},

		"page:fragments": {
			handler: async (_event: unknown, ctx: PluginContext) => {
				const tagline = await getCurrentTagline(ctx);
				if (!tagline) return null;
				return [
					{
						kind: "inline-script" as const,
						placement: "head" as const,
						code: `window.EMDASH_TAGLINE = ${JSON.stringify(tagline)};
document.addEventListener("DOMContentLoaded", function() {
  var el = document.querySelector(".footer-tagline");
  if (el) el.textContent = window.EMDASH_TAGLINE;
});`,
					},
				];
			},
		},
	},

	routes: {
		admin: {
			handler: async (routeCtx: any, ctx: PluginContext) => {
				const interaction = routeCtx.input as {
					type: string;
					page?: string;
					action_id?: string;
					values?: Record<string, string>;
				};

				if (interaction.type === "form_submit" && interaction.action_id === "save_settings") {
					await ctx.kv.set("settings:taglines", interaction.values?.taglines ?? "");
					await ctx.kv.set("settings:mode", interaction.values?.mode ?? "random");
					await ctx.kv.set("state:currentIndex", 0);
					return {
						blocks: await settingsBlocks(ctx),
						toast: { message: "Settings saved", type: "success" },
					};
				}

				return { blocks: await settingsBlocks(ctx) };
			},
		},

		current: {
			public: true,
			handler: async (_routeCtx: unknown, ctx: PluginContext) => {
				const tagline = await getCurrentTagline(ctx);
				return { tagline };
			},
		},
	},
});
