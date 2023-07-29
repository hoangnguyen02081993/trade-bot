import { ConfigurableModuleBuilder } from '@nestjs/common';
import { CcxtConfig } from './interfaces/ccxt.interface';

export const {
    ConfigurableModuleClass: CcxtConfigurableModuleClass,
    MODULE_OPTIONS_TOKEN,
    OPTIONS_TYPE: CCXT_OPTIONS,
    ASYNC_OPTIONS_TYPE: CCXT_ASYNC_OPTIONS,
} = new ConfigurableModuleBuilder<CcxtConfig>()
    .setExtras(
        { isGlobal: false } as { isGlobal?: boolean },
        (definition, extras) => ({
            ...definition,
            global: extras.isGlobal,
        }),
    )
    .build();
