// Rollup build script

// Do this first so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const fs = require('fs');

const bundles = [
  {
    format: 'es',
    ext: '.es6.js',
    plugins: [],
    moduleName: 'waterwheel'
  },
  {
    format: 'umd',
    ext: '.js',
    plugins: [],
    moduleName: 'waterwheel'
  }
];

let promise = Promise.resolve();

// Compile into a distributable format with Babel and Rollup
for (const config of bundles) {
  promise = promise.then(() =>
    rollup
      .rollup({
        entry: 'lib/waterwheel.js',
        external: [],
        plugins: [
          nodeResolve({
            extensions: ['.js', '.json']
          }),
          babel({
            exclude: ['/node_modules/'],
            presets: [
              ['env', {
                modules: false
              }]
            ],
            plugins: [
              'external-helpers'
            ]
          })
        ].concat(config.plugins)
      })
      .then(bundle =>
        bundle.write({
          dest: `dist/${config.moduleName || 'main'}${config.ext}`,
          format: config.format,
          sourceMap: !config.minify,
          moduleName: config.moduleName,
          globals: {}
        })
      )
  );
}

// Copy LICENSE (if any)
promise = promise.then(() => {
  fs.writeFileSync(
    'dist/LICENSE',
    fs.readFileSync('LICENSE', 'utf-8'),
    'utf-8'
  );
});

promise.catch(err => console.error(err.stack)); // eslint-disable-line no-console
