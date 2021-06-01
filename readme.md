# vite-plugin-ejs

Use [ejs](https://www.npmjs.com/package/ejs) template language in your entrypoint i.e `index.html`

### Install

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

### Default data

The object below is the default data of the render function.

```javascript
return {
  NODE_ENV: config.mode,
  isDev: config.mode === "development"
}
```
