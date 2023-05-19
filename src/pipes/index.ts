import { ArgumentMetadata, PipeTransform } from '@nestjs/common';

export class ParseBooleanPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const output = value === 'false' ? false : true;

    return output;
  }
}
