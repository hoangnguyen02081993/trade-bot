import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Exchange, pro as ccxt  } from 'ccxt';
import { MODULE_OPTIONS_TOKEN } from './ccxt.const';
import { CcxtConfig, ExchangeOption } from './interfaces/ccxt.interface';

@Injectable()
export class CcxtService implements OnModuleInit {
  private _clients: Map<string, Exchange> = {} as Map<string, Exchange>;
  private options: Map<string, ExchangeOption> = {} as Map<string, ExchangeOption>;
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private configuration: CcxtConfig
  ) { }

  async onModuleInit(): Promise<void> {
    if (!this.configuration) return
    const { exchanges } = this.configuration

    await Promise.all(Array.from(exchanges).map(async (exchange) => {
      this.options[exchange.exchangeId] = exchange
      await this.loadExchange(exchange.exchangeId, exchange)
    }))
  }

  private async loadExchange(exchangeId: string, config: Partial<ExchangeOption>) {
    if (!config) return

    const { apiKey, secret, sandboxMode, verbose } = config

    this._clients[exchangeId] = new ccxt[exchangeId]({
      apiKey,
      secret,
      verbose
    })

    if (sandboxMode) this._clients[exchangeId].setSandboxMode(true)
  }

  /**
   *
   * @param {ccxt.ExchangeId} exchangeId The exchange identifier
   * @param {Partial<ccxt.Exchange>} options Any Ccxt options
   * @returns {ccxt.Exchange} Instance of the ccxt client
   */
  private async getExchange(
    exchangeId: string,
    options: Partial<Exchange> & Partial<ExchangeOption>,
  ): Promise<Exchange> {
    // Check if exchange has been loaded
    if (!this._clients[exchangeId]) await this.loadExchange(exchangeId, options);
    return this._clients[exchangeId]
  }

  /**
   * Get an instance of the ccxt client for the provided exchange
   * @param {ccxt.ExchangeId} exchangeId The exchange identifier
   * @param {Partial<ccxt.Exchange>} options Any Ccxt options passed to the exchange instance
   * @returns {ccxt.Exchange} Instance of the ccxt client
   */
  public async getClient(
    exchangeId: string,
    options?: Partial<ExchangeOption> & Partial<Exchange>,
  ): Promise<Exchange> {
    return await this.getExchange(exchangeId, options);
  }
}