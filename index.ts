import {Plugin, ResolvedConfig, UserConfig} from "vite";
import ejs from "ejs";

// ShortHand for EjsOptions or Undefined
type EjsRenderOptions = ejs.Options & { async?: false };
type EjsRenderOptionsFn = (config: ResolvedConfig) => EjsRenderOptions;
type ViteEjsPluginDataType = Record<string, any> | ((config: ResolvedConfig) => Record<string, any>);
type ViteEjsPluginOptions = { ejs?: EjsRenderOptions | EjsRenderOptionsFn };

/**
 * Vite Ejs Plugin Function
 * See https://github.com/trapcodeio/vite-plugin-ejs for more information
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
        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },

        transformIndexHtml: {
            enforce: "pre",
            transform(html) {
                // config.isProduction
                try {
                    if (typeof data === "function") data = data(config);
                    let ejsOptions = options && options.ejs ? options.ejs : {};
                    if (typeof ejsOptions === "function") ejsOptions = ejsOptions(config);


                    html = ejs.render(
                        html,
                        {
                            NODE_ENV: config.mode,
                            isDev: config.mode === "development",
                            ...data
                        },
                        {
                            views: [config.root], // Set views directory that can be overwritten
                            ...ejsOptions,
                            async: false // Force sync
                        }
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