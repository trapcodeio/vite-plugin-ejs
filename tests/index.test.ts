import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import type { Plugin, ResolvedConfig } from "vite";
import { ViteEjsPlugin, ejs } from "../index";

/**
 * Helpers
 * -------
 * The plugin is a pair of Vite hooks. Instead of running a full Vite build,
 * we drive the hooks exactly the way Vite would: first `configResolved` to
 * inject the resolved config, then `transformIndexHtml` to render the html.
 * This keeps the tests fast and deterministic while exercising the real logic.
 */

const FIXTURES = resolve(__dirname, "fixtures");

function fakeConfig(overrides: Partial<ResolvedConfig> = {}): ResolvedConfig {
    return {
        mode: "development",
        root: FIXTURES,
        ...overrides
    } as ResolvedConfig;
}

/** Invoke an object-or-function Vite hook. */
function callHook<T extends Function>(hook: any, ...args: any[]) {
    const fn: T = typeof hook === "function" ? hook : hook.handler;
    return fn(...args);
}

/** Build the plugin, feed it a config, and transform the given html. */
function render(
    html: string,
    data?: Parameters<typeof ViteEjsPlugin>[0],
    options?: Parameters<typeof ViteEjsPlugin>[1],
    configOverrides?: Partial<ResolvedConfig>
): string {
    const plugin: Plugin = ViteEjsPlugin(data, options);
    callHook(plugin.configResolved, fakeConfig(configOverrides));
    const out = callHook(plugin.transformIndexHtml, html, { path: "/index.html", filename: "index.html" });
    return out as string;
}

describe("plugin shape", () => {
    it("returns a vite plugin named vite-plugin-ejs", () => {
        const plugin = ViteEjsPlugin();
        expect(plugin.name).toBe("vite-plugin-ejs");
        expect(plugin).toHaveProperty("transformIndexHtml");
        expect(plugin).toHaveProperty("configResolved");
    });

    it("registers transformIndexHtml with order 'pre'", () => {
        const plugin = ViteEjsPlugin();
        expect((plugin.transformIndexHtml as any).order).toBe("pre");
    });

    it("re-exports ejs", () => {
        expect(typeof ejs.render).toBe("function");
    });
});

describe("rendering user data", () => {
    it("renders ejs variables from the data object", () => {
        const html = render("<title><%= domain %> | <%= title %></title>", {
            domain: "example.com",
            title: "My project"
        });
        expect(html).toBe("<title>example.com | My project</title>");
    });

    it("leaves plain html untouched when there are no tags", () => {
        const html = "<h1>Static</h1>";
        expect(render(html)).toBe(html);
    });

    it("supports conditionals via the default isDev flag", () => {
        const template = "<% if (isDev) { %>DEV<% } else { %>PROD<% } %>";
        expect(render(template)).toBe("DEV");
        expect(render(template, {}, undefined, { mode: "production" })).toBe("PROD");
    });
});

describe("default data", () => {
    it("injects NODE_ENV and isDev from config.mode in development", () => {
        const html = render("<%= NODE_ENV %>:<%= isDev %>");
        expect(html).toBe("development:true");
    });

    it("injects NODE_ENV and isDev from config.mode in production", () => {
        const html = render("<%= NODE_ENV %>:<%= isDev %>", {}, undefined, { mode: "production" });
        expect(html).toBe("production:false");
    });

    it("lets user data override default keys", () => {
        const html = render("<%= NODE_ENV %>", { NODE_ENV: "custom" });
        expect(html).toBe("custom");
    });
});

describe("data as a function", () => {
    it("calls the data function with the resolved config", () => {
        let received: ResolvedConfig | undefined;
        const html = render("<%= root %>", (config) => {
            received = config;
            return { root: config.root };
        });
        expect(html).toBe(FIXTURES);
        expect(received?.root).toBe(FIXTURES);
    });
});

describe("ejs options", () => {
    it("honours a custom delimiter", () => {
        const html = render("<?= title ?>", { title: "Hi" }, { ejs: { delimiter: "?" } });
        expect(html).toBe("Hi");
    });

    it("accepts ejs options as a function of config", () => {
        let received: ResolvedConfig | undefined;
        const html = render(
            "<?= title ?>",
            { title: "Hi" },
            {
                ejs: (config) => {
                    received = config;
                    return { delimiter: "?" };
                }
            }
        );
        expect(html).toBe("Hi");
        expect(received?.mode).toBe("development");
    });
});

describe("ejs includes", () => {
    it("resolves includes relative to config.root via the views option", () => {
        const html = render("<%- include('partial', { name: 'World' }) %>");
        expect(html.trim()).toBe("<p>Hello World</p>");
    });
});
