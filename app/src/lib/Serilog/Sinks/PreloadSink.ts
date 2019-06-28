import { ILogSink, LogEvent, LogLevel } from '../Serilog';

export class PreloadSink implements ILogSink
{
    static SerializeRaw: Record<string, boolean> =
        {
            ["nil"]: false,
            ["boolean"]: true,
            ["number"]: true,
            ["string"]: false,
            ["table"]: false,
            ["function"]: false,
            ["userdata"]: false,
        }

    constructor(private readonly logLevel: LogLevel, public readonly FileName: string) { }

    LogLevel(): LogLevel { return this.logLevel; }

    private LogEventToJson(logEvent: LogEvent): string
    {
        let json: string = "{";
        //json += "ty:" + logEvent.Type + ", "; // Commented out for now, since anything that doesn't have a value, should be treated as text.
        json += "t:\"" + logEvent.Text + "\"";
        if(logEvent.Value)
        {
            const serializeRaw: boolean = PreloadSink.SerializeRaw[type(logEvent.Value)];
            if (serializeRaw)
            {
                json += ",v:" + logEvent.Value;
            }
            else
            {
                json += ",v:\"" + logEvent.Value + "\"";
            }
        }
        json += "}";
        return json;
    }

    Log(level: LogLevel, events: LogEvent[]): void
    {
        let json: string = "{";

        json += "l:" + level + ",";
        json += "e:{"
        for (let index = 0; index < events.length; index++)
        {
            json += this.LogEventToJson(events[index]);
            if (index < events.length - 1)
                json += ",";
        }
        json += "}" // events
        json += "}"; // root
        PreloadGenStart()
        Preload("l" + json)
        PreloadGenEnd(this.FileName)
    }
}