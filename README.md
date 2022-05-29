# Bikemap.net Export GPX and KML routes

Download GPX and KML files for a route on bikemap.net

This is a first version with a very limited range of functions

Screenshot:
![Screenshot export route](https://raw.githubusercontent.com/cvzi/bikemapnet-userscript/master/screenshots/exportFormat.png)

## Development

Clone the repository and install dependencies with npm
```sh
git clone git@github.com:cvzi/bikemapnet-userscript.git
cd bikemapnet-userscript
npm install
```

### Bundle

Bundle everything from `src/` into `dist/bundle.user.js`:

`npm run build`

or

`npx rollup --config`


### Development server
`npm run serve`

or

`node -r esm server.js`

This will automatically update `dist/bundle.user.js` when code changes and serve it on [localhost:8124](http://localhost:8124/).

It also creates a second userscript `dist/dev.user.js`, if you install it in Tampermonkey, it will automatically fetch the latest version from http://localhost:8124/bundle.user.js once you reload a website with F5.


### Bundle without source map

Bundle for publishing without sourcemapping to `dist/release-3.2.1.user.js`

`npm run build:release`

or on Windows

`npm run build:release:win32`

