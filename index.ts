import {Plugin} from "vite";
import ejs from "ejs";

// ShortHand for EjsOptions or Undefined
type EjsRenderOptions = (ejs.Options & { async: false }) | undefined;
type ViteEjsPluginDataType = Record<string, any> | ((...args: any[]) => Record<string, any>);
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
    return {
        name: "vite-plugin-ejs",

        /**
         * Force full reload on .html change
         */
        handleHotUpdate({file, server}) {
            if (file.endsWith(".html")) {
                server.ws.send({
                    type: "full-reload"
                });
            }
        },

        transformIndexHtml: {
            enforce: "pre",
            transform(html) {
                try {
                    if (typeof data === "function") data = data();

                    html = ejs.render(
                        html,
                        {
                            NODE_ENV: process.env.NODE_ENV,
                            isDev: process.env.NODE_ENV === "development",
                            ...data
                        },
                        options?.ejs
                    );
                } catch (e) {
                    return e.message;
                }

                return html;
            }
        }
    };
}

export {ViteEjsPlugin, ejs}