const esbuild = require("esbuild");
const glob = require("glob");

esbuild.build({
        entryPoints: ["src/extension.ts"],
        outdir: "build",
        format: "cjs",
        target: "es2018",
        sourcemap: true
}).catch(() => process.exit(1));

const files = glob.sync("ts/**/*.ts")
        .filter(file => !file.includes("common.ts"));
esbuild.build({
        entryPoints: files,
        bundle: true,
        outdir: "js",
        format: "cjs",
        target: "es2018",
        sourcemap: true,
        outExtension: { ".js": ".js" }
}).catch(() => process.exit(1));
