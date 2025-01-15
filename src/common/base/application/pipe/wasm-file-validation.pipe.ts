import {
  BadRequestException,
  HttpStatus,
  Injectable,
  ParseFilePipeBuilder,
  PipeTransform,
} from '@nestjs/common';

enum ALLOWED_FILE_TYPE {
  WASM = 'application/wasm',
}

@Injectable()
export class WasmFileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedTypeRegex = new RegExp(
      ALLOWED_FILE_TYPE.WASM.replace(/[\/\\]/g, '\\$&'),
    );

    const parseFilePipe = new ParseFilePipeBuilder()
      .addFileTypeValidator({ fileType: allowedTypeRegex })
      .addMaxSizeValidator({ maxSize: 5242880 })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });

    return parseFilePipe.transform(file);
  }
}
