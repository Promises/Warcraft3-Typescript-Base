import {Log, LogLevel} from "./lib/Serilog/Serilog";
import {StringSinkTest} from "./lib/Serilog/Sinks/StringSinkTest";
import '../spec/ceresmocking'
import {Main} from "./main";

Log.Init([
    new StringSinkTest(LogLevel.Fatal, print),
]);


describe("FourCC", () => {
    it("converts to and from FourCC", () => {
        _G.FourCC = function (this: void, input: string): number {
            // @ts-ignore
            return string.unpack(">I4", input)[0];
        };
        const main = new Main();
        let DecodeFourCCSpy = mock(main.DecodeFourCC);

        let inputFourCC: string = 'I01T';
        let FourCCd: number = FourCC(inputFourCC);
        let ReverseFourCCd: string = DecodeFourCCSpy(FourCCd);


        assert.equals(inputFourCC, ReverseFourCCd);

    })
});
