import {Plugin, ResolvedConfig} from "vite";
import ejs from "ejs";

// ShortHand for EjsOptions or Undefined
type EjsRenderOptions = (ejs.Options & { async: false }) | undefined;
type ViteEjsPluginDataType = Record<string, any> | ((config: ResolvedConfig) => Record<string, any>);
type ViteEjsPluginOptions = {ejs: EjsRenderOptions};

/**
 * Vite Ejs Plugin Function
 *
 * @example
 * export default defineConfig({
 *  plugins: [
 *    vue(),
 *    ViteEjsPlugin({foo: 'bar'})
 *  ],
 * });
 */
function ViteEjsPlugin(data: ViteEjsPluginDataType = {}, options?: ViteEjsPluginOptions): Plugin {
    let config: ResolvedConfig;

    return {
        name: "vite-plugin-ejs",

        // Get Resolved config
        configResolved(resolvedConfig){
            config = resolvedConfig;
        },

        transformIndexHtml: {
            enforce: "pre",
            transform(html) {
                // config.isProduction
                try {
                    if (typeof data === "function") data = data(config);

                    html = ejs.render(
                        html,
                        {
                            NODE_ENV: config.mode,
                            isDev: config.mode === "development",
                            ...data
                        },
                        options?.ejs
                    );
                } catch (e: any) {
                    return e.message;
                }

                return html;
            }
        }
    };
}

export {ViteEjsPlugin, ejs}