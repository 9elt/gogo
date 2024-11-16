import CleanCSS from "clean-css";
import { readdir } from "node:fs/promises";
import config from "./build.config";

const build = await Bun.build({
    entrypoints: [config.entrypoint],
    outdir: config.outdir,
    minify: config.minify,
});

if (!build.success) {
    console.log(build);
    throw new Error("Build failed");
}

await Bun.write(
    config.outdir + '/index.html',
    await Bun.file(config.html).text()
);

let css = '';
const cssFiles = (await readdir(config.stylesdir)).sort((a, b) =>
    (b.includes("common") ? 1 : 0) -
    (a.includes("common") ? 1 : 0)
);

for (const name of cssFiles) {
    try {
        css += "/* " + name + " */\n";
        css += await Bun.file(config.stylesdir + '/' + name).text();
    }
    catch (error) {
        console.log('CSS error', name, error);
        process.exit(1);
    }
}

if (config.minify) {
    css = new CleanCSS().minify(css).styles;
}

await Bun.write(config.outdir + '/index.css', css);
