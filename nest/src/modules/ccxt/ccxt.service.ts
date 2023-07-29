import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import ccxt, { Exchange } from 'ccxt';
import { MODULE_OPTIONS_TOKEN } from './ccxt.const';
import { CcxtConfig } from './interfaces/ccxt.interface';

export type ConfigType = { apiKey: string, secret: string, sandboxMode: boolean, verbose: boolean, }

@Injectable()
export class CcxtService implements OnModuleInit {
  private _clients: Map<string, Exchange> = {} as Map<string, Exchange>;
  private _lastMarketsFetch: Map<string, number> = {} as Map<string, number>;
  private options = {
    marketsCacheExpireMs: 20000,
    sandboxMode: true
  }
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private configuration: CcxtConfig
  ) {
  }
  async onModuleInit(): Promise<void> {
    if (!this.configuration) return
    const { exchanges } = this.configuration
    await Promise.all(exchanges.map(async (exchanges) => {
      await this.loadExchange(exchanges.exchangeId, exchanges, exchanges.loadMarkets)
    }))
  }
  private async loadExchange(exchangeId: string, config: Partial<ConfigType>, loadMarkets: boolean) {
    if (!config) return
    const { apiKey, secret, sandboxMode, verbose } = config

    this._clients[exchangeId] = new ccxt[exchangeId]({
      apiKey,
      secret,
      sandboxMode: true,
      verbose
    })
    if (sandboxMode) this._clients[exchangeId].setSandboxMode(true)
    if (loadMarkets === true) await this.loadExchangeMarkets(exchangeId);
  }

  private async loadExchangeMarkets(exchangeId: string) {
    await this._clients[exchangeId].loadMarkets(true);
    // Save the fetching timestamp (milliseconds)
    this._lastMarketsFetch[exchangeId] = Date.now();
  }

  /**
   * Check if the exchange cache has expired
   * @param {ccxt.ExchangeId} exchangeId Exchange cache identifier
   * @returns {boolean}
   */
  private marketsCacheExpired(exchangeId: string): boolean {
    const lastFetch: number = this._lastMarketsFetch?.[exchangeId] || 0;
    return Date.now() - lastFetch > this.options.marketsCacheExpireMs;
  }

  /**
   *
   * @param {ccxt.ExchangeId} exchangeId The exchange identifier
   * @param {Partial<ccxt.Exchange>} options Any Ccxt options
   * @returns {ccxt.Exchange} Instance of the ccxt client
   */
  private async getExchange(
    exchangeId: string,
    options: Partial<Exchange> & Partial<ConfigType>,
  ): Promise<Exchange> {
    // Check if exchange has been loaded
    if (!this._clients[exchangeId]) {
      await this.loadExchange(exchangeId, options, true);
    }

    if (this.marketsCacheExpired(exchangeId)) {
      await this.loadExchangeMarkets(exchangeId);
    }



    // Return a new instance to the user and copy all markets data from cache
    const userClient = new ccxt[exchangeId](options);
    [
      'ids',
      'markets',
      'markets_by_id',
      'marketsById',
      'currencies',
      'currencies_by_id',
      'baseCurrencies',
      'quoteCurrencies',
      'symbols',
      'verbose',
    ].forEach(prop => {
      userClient[prop] = this._clients[exchangeId][prop];
    });
    // Set Sandbox Mode
    if (this.options?.sandboxMode === true) userClient.setSandboxMode(true);
    return userClient;
  }

  /**
   * Get an instance of the ccxt client for the provided exchange
   * @param {ccxt.ExchangeId} exchangeId The exchange identifier
   * @param {Partial<ccxt.Exchange>} options Any Ccxt options passed to the exchange instance
   * @returns {ccxt.Exchange} Instance of the ccxt client
   */
  public async getClient(
    exchangeId: string,
    options?: Partial<ConfigType> & Partial<Exchange>,
  ): Promise<Exchange> {
    return await this.getExchange(exchangeId, options);
  }
}