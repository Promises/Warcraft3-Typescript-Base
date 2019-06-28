import { Log, LogLevel } from './lib/Serilog/Serilog';
import { StringSink } from './lib/Serilog/Sinks/StringSink';

Log.Init([
    new StringSink(LogLevel.Debug, BJDebugMsg),
]);

function Main(this: void): void {
    Log.Information('Hello World');
}
function PrintError(err: any) {
    Log.Fatal(err);
}
xpcall(() => {
    const init: trigger = CreateTrigger();
    TriggerRegisterTimerEvent(init, 0, false);
    TriggerAddAction(init, () => xpcall(() => Main(), err => PrintError(err)));
},     (err) => {
    PrintError(err);
});

