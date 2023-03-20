import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor() {}
}
