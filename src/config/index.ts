import { config } from 'dotenv';

export class ConfigService {
  private static _instance: ConfigService;
  constructor() {
    config({ path: '.env' });
  }

  static getInstance() {
    if (this._instance) return this._instance;
    this._instance = new ConfigService();
    return this._instance;
  }

  public get(key: string): string {
    return process.env[key];
  }

  public getNumber(key: string): number {
    return Number(this.get(key));
  }
}
