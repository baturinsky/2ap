import esbuild from "esbuild";
import { glslify } from 'esbuild-plugin-glslify';

let options = {
  entryPoints: ["src/index.tsx"],
  bundle: true,
  sourcemap: true,
  outfile: "./public/bundle.js",
  minify: false,
  plugins: [glslify({
    extensions: ['vs', 'fs', '.glsl', '.frag.shader'],
    compress: false,
  })],
}

let builder;
if (process.argv[2] == "--serve") {
  builder = esbuild.serve(
    {
      servedir: "./public",
      port: 3100,
      onRequest: (r) => {
        console.log(r);
      }
    }, options)
} else {
  builder = esbuild.build(options);
}

builder.catch(error => {
  console.error(error);
  process.exit(1)
})
  .then(result => {
    console.log(result);
  });
