import { Log, LogLevel } from './lib/Serilog/Serilog';
import { StringSink } from './lib/Serilog/Sinks/StringSink';

ceres.addHook('main::after', () => {


    Log.Init([
        new StringSink(LogLevel.Debug, BJDebugMsg),
    ]);

    function Main(this: void): void {
        Log.Information('Hello World');
        Log.Information(`${FourCC('I01T')}`);
        Log.Information(`${DecodeFourCC(FourCC('I01T'))}`);


    }
    function PrintError(err: any) {
        Log.Fatal(err);
    }
    function DecodeFourCC(fourcc: number): string {
        // tslint:disable-next-line:no-bitwise
        return string.char((fourcc >>> 24) & 255, (fourcc >>> 16) & 255, (fourcc >>> 8) & 255, (fourcc) & 255);
    }
    xpcall(() => {
        const init: trigger = CreateTrigger();
        TriggerRegisterTimerEvent(init, 0, false);
        TriggerAddAction(init, () => xpcall(() => Main(), err => PrintError(err)));
    },     (err) => {
        PrintError(err);
    });

});



