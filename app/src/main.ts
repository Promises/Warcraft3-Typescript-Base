import { Log, LogLevel } from './lib/Serilog/Serilog';
import { StringSink } from './lib/Serilog/Sinks/StringSink';


export class Main {

    static PrintError(err: any) {
        Log.Fatal(err);
    }
    DecodeFourCC(fourcc: number): string {
        // tslint:disable-next-line:no-bitwise
        return string.char((fourcc >>> 24) & 255, (fourcc >>> 16) & 255, (fourcc >>> 8) & 255, (fourcc) & 255);
    }

    constructor() {
        Log.Information('Hello World');
        Log.Information(`${FourCC('I01T')}`);
        Log.Information(`${this.DecodeFourCC(FourCC('I01T'))}`);
    }

}

ceres.addHook('main::after', () => {


    Log.Init([
        new StringSink(LogLevel.Debug, BJDebugMsg),
    ]);


    xpcall(() => {
        const init: trigger = CreateTrigger();
        TriggerRegisterTimerEvent(init, 0, false);
        TriggerAddAction(init, () => xpcall(() => new Main(), err => Main.PrintError(err)));
    },     (err) => {
        Main.PrintError(err);
    });

});






