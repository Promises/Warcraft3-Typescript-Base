import
{
    ILogSink,
    LogEvent,
    LogEventType,
    LogLevel
} from '../Serilog';

export class StringSink implements ILogSink
{
    static Prefix: Record<LogLevel, string> =
        {
            [LogLevel.None]: "|cffffffffNON|r",
            [LogLevel.Verbose]: "|cff9d9d9dVRB|r",
            [LogLevel.Debug]: "|cff9d9d9dDBG|r",
            [LogLevel.Information]: "|cffe6cc80INF|r",
            [LogLevel.Warning]: "|cffffcc00WRN|r",
            [LogLevel.Error]: "|cffff8000ERR|r",
            [LogLevel.Fatal]: "|cffff0000FTL|r",
        }

    static Colors: Record<string, string> =
        {
            ["nil"]: "9d9d9d",
            ["boolean"]: "1eff00",
            ["number"]: "00ccff",
            ["string"]: "ff8000",
            ["table"]: "ffcc00",
            ["function"]: "ffcc00",
            ["userdata"]: "ffcc00",
        }

    static Brackets: Record<string, boolean> =
        {
            ["nil"]: false,
            ["boolean"]: false,
            ["number"]: false,
            ["string"]: false,
            ["table"]: true,
            ["function"]: true,
            ["userdata"]: true,
        }

    constructor(private readonly logLevel: LogLevel, private printer: (this: void, message: string) => void) { }

    LogLevel(): LogLevel { return this.logLevel }

    Log(level: LogLevel, events: LogEvent[]): void
    {
        let message: string = "";

        for (let index = 0; index < events.length; index++)
        {
            const event = events[index];
            if (event.Type == LogEventType.Text)
            {
                message += event.Text;
            }
            else if (event.Type == LogEventType.Parameter)
            {
                const whichType = type(event.Value);
                const color = StringSink.Colors[whichType];
                if (color)
                    message += "|cff" + color;
                if (StringSink.Brackets[whichType])
                    message += "{ ";
                message += event.Value;
                if (StringSink.Brackets[whichType])
                    message += " }";
                if (color)
                    message += "|r";
            }
        }

        this.printer(string.format("[%s]: %s", StringSink.Prefix[level], message))
    }
}