# vite-plugin-ejs

Use [ejs](https://www.npmjs.com/package/ejs) template language in your entrypoint i.e `index.html`

## Menu

- [Installation](#installation)
- [Usage](#usage)
    - [Default Data](#default-data)
    - [Configure EJS](#configure-ejs)

### Installation

```sh
npm i vite-plugin-ejs
# or
yarn add vite-plugin-ejs
```

### Usage

File: **vite.config.js**

```javascript
import {defineConfig} from "vite";
import {ViteEjsPlugin} from "vite-plugin-ejs";

export default defineConfig({
  plugins: [
    // Without Data
    ViteEjsPlugin(),
    
    // With Data
    ViteEjsPlugin({
      domain: "example.com",
      title: "My vue project!"
    }),
    
    // Or With Vite Config
    ViteEjsPlugin((viteConfig) => {
      // viteConfig is the current viteResolved config.
      return {
        root: viteConfig.root,
        domain: "example.com",
        title: "My vue project!"
      }
    }),
  ],
});
```

File: **index.html**

```ejs
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <link rel="icon" href="/favicon.ico"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title><%= domain %> | <%= title %></title>

    <!-- Run Conditions-->
    <% if(isDev){ %>
        <script src="/path/to/development-only-script.js"></script>
    <% } else { %>
        <script src="/path/to/production-only-script.js" crossorigin="anonymous"></script>
    <% } %>
</head>
<body>
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>
</body>
</html>
```

Note: `isDev` is included in your data by default

### Default Data

The object below is the default data of the render function.

```javascript
return {
  NODE_ENV: config.mode,
  isDev: config.mode === "development"
}
```

### Configure EJS

You can configure ejs by passing an object to the plugin.

```js   
export default defineConfig({
  plugins: [
    ViteEjsPlugin(
        {title: 'My vue project!'},
        {
          ejs: {
            // ejs options goes here.
            beautify: true,
          },
        }
    ),
  ],
});
```

If you want to use `viteconfig` to configure ejs, you can pass a function to the plugin, the function will receive the
current vite config as the first argument.

```js
export default defineConfig({
  plugins: [
    ViteEjsPlugin(
        {title: 'My vue project!'},
        {
          ejs: (viteConfig) => ({
            // ejs options goes here.
            views: [viteConfig.publicDir]
          })
        }
    ),
  ],
});
```
