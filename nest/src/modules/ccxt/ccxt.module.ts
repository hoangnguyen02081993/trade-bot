import { Module } from "@nestjs/common";
import { CcxtService } from "./ccxt.service";

@Module({
    imports:[],
    exports:[
        CcxtService
    ],
    providers:[
        CcxtService
    ]
})
export class CcxtModule {}