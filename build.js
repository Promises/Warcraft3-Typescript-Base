const fs = require('fs-extra');
const jassToTs = require('./node_modules/convertjasstots/dist/jassParser');
const typescriptToLua = require('typescript-to-lua');
const ts = require("typescript");
const {execSync} = require('child_process');
const minimist = require('minimist');
let reportDiagnostic = typescriptToLua.createDiagnosticReporter(true);


const helptext = `
Usage: build.js [options]
    options:
        -b, --build             Build the project
        -j, --jass              Generate typescript declarations
        -r, --run               Run the map in Warcraft 3
        -h, --help              Shows this help menu
`;
class Build {

    constructor(args) {
        this.os = process.platform;
        if (args['help'] || args['h']) {
            console.log(helptext);
            process.exit(1)
        }
        this.doTasks(args)

    }

    async doTasks(args) {
        if (args['jass'] || args['j']) {
            await this.generateTs()
        }

        if (args['build'] || args['b']) {
            await this.build()
        }

        if (args['run'] || args['r']) {
            this.run()
        }
    }

    env() {
        const dir = './config';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        if (!fs.existsSync(`${dir}/warcraft.json`)) {
            console.log('missing file');
            fs.writeFileSync(`${dir}/warcraft.json`, JSON.stringify({
                path: '',
            }))
        }
        this.settings = JSON.parse(fs.readFileSync(`${dir}/warcraft.json`));
        if (!this.settings.path.length > 0) {
            console.error('Path to wc3 is not setup, please set it in ./config/warcraft.json');
            process.exit(1)
        }

    }

    nativeExecute(cmdline) {
        execSync(cmdline, (err, stdout, stderr) => {
            if (err) {
                throw err;
            }
            return false;

        });
        return true;
    }

    async build() {
        this.cleanup();

        var map = 'map.w3x';
        fs.mkdirSync('target');

        fs.copySync(`maps/${map}`, `target/${map}`);

        let sharedArgs = `extract "target/${map}" "war3map.lua" "maps/map"`;
        let mpqEditor = '';
        if (this.os === "win32") {
            mpqEditor = 'tools/MPQEditor/x64/MPQEditor.exe';
        } else {
            mpqEditor = "WINEDEBUG=-all wine64 tools/MPQEditor/x64/MPQEditor.exe";
        }

        this.nativeExecute(`${mpqEditor} ${sharedArgs}`);

        const {emitResult, diagnostics} = typescriptToLua.transpileProject('tsconfig.json');
        for (let diag of diagnostics) {
            console.log(diag.messageText);
            if (diag.code != 2306) {
                console.error('FATAL ERROR IN TYPESCRIPT');
                console.error(diag);
                throw diag;

            }

        }

        emitResult.forEach(({name, text}) => ts.sys.writeFile(name, text));
        fs.copySync(`src/app/src/main.lua`, `src/main.lua`);

        sharedArgs = `build "map"`;
        let ceres = '';
        switch (this.os) {
            case "win32":
                ceres = 'tools/ceres/ceres.exe';
                break;
            case "darwin":
                ceres = "tools/ceres/ceres";
                break;
            default:
                ceres = "tools/ceres/ceres-linux";
                break;
        }
        //
        this.nativeExecute(`${ceres} ${sharedArgs}`);
        let sed = '';

        switch (this.os) {
            case "win32":
                sed = 'tools/sed.exe';
                break;
            default:
                sed = "LC_ALL=C sed";
                break;
        }
        this.nativeExecute(`${sed} -i "s/local function __module_/function __module_/g" "target/map/war3map.lua"`);


        sharedArgs = `add "target/map.w3x" "target/map/*" "/c" "/auto" "/r"`;
        //
        this.nativeExecute(`${mpqEditor} ${sharedArgs}`);
    }


    run() {
        this.env();
        let suffix = '';
        let sharedArgs = `-windowmode windowed -nowfpause -loadfile `;
        let currentDir = String(__dirname);
        switch (this.os) {
            case "linux":
                suffix = "WINEDEBUG=-all wine64 ";
                currentDir = String(currentDir).replace('/', '\\');
                sharedArgs += '"Z:' + currentDir + '\\target\\map.w3x"';
                break;
            case "win32":
                sharedArgs += currentDir + '\\target\\map.w3x"';
                break;
            default:
                suffix = "";
                break;
        }


        console.log(`${suffix}"${this.settings.path}" ${sharedArgs}`);
        this.nativeExecute(`${suffix}"${this.settings.path}" ${sharedArgs}`);
    }

    cleanup() {
        if (fs.existsSync(`./src`)) {
            fs.removeSync('./src');
        }
        if (fs.existsSync(`./target`)) {
            fs.removeSync('./target');
        }
    }

    async generateTs() {
        const parser = new jassToTs.JassParser();
        await parser.main(['', '', "app/src/lib/core/blizzard.j", "app/src/lib/core/blizzard.d.ts"]);
        await parser.main(['', '', "app/src/lib/core/common.j", "app/src/lib/core/common.d.ts"]);
        await parser.main(['', '', "app/src/lib/core/common.ai", "app/src/lib/core/commonai.d.ts"]);

    }


}

new Build(minimist(process.argv));
