import ccxt, { Exchange } from 'ccxt';

import { Injectable, OnModuleInit } from "@nestjs/common";

export type ConfigType = { apiKey: string, secret: string, sandboxMode: boolean, verbose: boolean, }

@Injectable()
export class CcxtService  {
  private _clients: Map<string, Exchange> = {} as Map<
    string,
    Exchange
  >;
  private _lastMarketsFetch: Map<string, number> = {} as Map<
    string,
    number
  >;
  private options = {
    marketsCacheExpireMs: 20000,
    sandboxMode: true
  }
  constructor(
  ) {
  }
  async onModuleInit(): Promise<void> {
    const configs = [{
      exchangeId: 'binance',
      apiKey: 'H53JItGKH62uDYdy6DnN43Ky61oxy77k44EcZOiKgdtFXfCE3cSLgxke0pJoT0q3',
      secret: 'V1y1X6viGQ85oyKVGGVce6NFriqlLFzwU519J9AizfnJkafZ3GqSM3TjIsQNIFRE',
      sandboxMode: true,
      loadMarketsOnStartup: false,
      verbose: false,
      loadMarkets: false
    }]
    await Promise.all(configs.map(async (config) => {
      await this.loadExchange(config.exchangeId, config, config.loadMarkets)
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