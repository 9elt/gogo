const build = await Bun.build({
    entrypoints: ["src/index.ts"],
    outdir: "docs",
    minify: false,
});

if (!build.success) {
    throw new Error("Build failed");
}
