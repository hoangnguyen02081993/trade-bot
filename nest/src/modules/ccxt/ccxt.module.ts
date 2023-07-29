import { Module, DynamicModule } from "@nestjs/common";
import { CcxtService } from "./ccxt.service";
import { CCXT_ASYNC_OPTIONS, CCXT_OPTIONS, CcxtConfigurableModuleClass } from "./ccxt.const";

@Module({
    exports: [CcxtService],
    providers: [CcxtService]
})
export class CcxtModule extends CcxtConfigurableModuleClass {
    static register(options: typeof CCXT_OPTIONS): DynamicModule {
        return {
            ...super.register(options),
        };
    }

    static registerAsync(options: typeof CCXT_ASYNC_OPTIONS): DynamicModule {
        return {
            ...super.registerAsync(options),
        };
    }
}