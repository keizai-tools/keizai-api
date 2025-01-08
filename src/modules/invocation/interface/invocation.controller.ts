import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { ResilienceInterceptor, RetryStrategy } from 'nestjs-resilience';

import { WasmFileValidationPipe } from '@/common/base/application/pipe/wasm-file-validation.pipe';
import {
  IPromiseResponse,
  IResponse,
} from '@/common/response_service/interface/response.interface';
import {
  ContractErrorResponse,
  RunInvocationResponse,
} from '@/common/stellar_service/application/interface/soroban';
import { Auth } from '@/modules/auth/application/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/domain/auth_type.enum';
import { Method } from '@/modules/method/domain/method.domain';
import { CurrentUser } from '@/modules/user/application/decorator/current_user.decorator';
import { User } from '@/modules/user/domain/user.domain';

import { CreateInvocationDto } from '../application/dto/create-invocation.dto';
import { InvocationResponseDto } from '../application/dto/invocation-response.dto';
import { UpdateInvocationDto } from '../application/dto/update-invocation.dto';
import { InvocationService } from '../application/service/invocation.service';

@Auth(AuthType.Bearer)
@ApiTags('Invocation')
@Controller('invocation')
export class InvocationUserController {
  constructor(private readonly invocationService: InvocationService) {}

  @Post()
  async create(
    @CurrentUser() data: IResponse<User>,
    @Body() createInvocationDto: CreateInvocationDto,
  ): IPromiseResponse<InvocationResponseDto> {
    console.log('1. create');
    return this.invocationService.createByUser(
      createInvocationDto,
      data.payload.id,
    );
  }

  @Get('/:id')
  findOne(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<InvocationResponseDto> {
    console.log('2. findOne');
    return this.invocationService.findOneByInvocationAndUserIdToDto(
      id,
      data.payload.id,
    );
  }

  @Post('/:id/run')
  runInvocation(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
    @Body()
    {
      signedTransactionXDR,
    }: {
      signedTransactionXDR?: string;
    },
  ): IPromiseResponse<RunInvocationResponse | ContractErrorResponse> {
    console.log('3. runInvocation');
    return this.invocationService.runInvocationByUser(
      id,
      data.payload.id,
      signedTransactionXDR,
    );
  }

  @Get('/:id/prepare')
  prepareInvocation(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<string> {
    console.log('4. prepareInvocation');
    return this.invocationService.prepareInvocationByUser(id, data.payload.id);
  }

  @Get(':id/methods')
  findAllMethods(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<Method[]> {
    console.log('5. findAllMethods');
    return this.invocationService.findAllMethodsByUser(id, data.payload.id);
  }

  @Get('/wasm-files/list')
  async listWasmFiles(
    @CurrentUser() data: IResponse<User>,
  ): IPromiseResponse<{ id: string }[]> {
    console.log('6. listWasmFiles');
    return this.invocationService.listWasmFiles(data.payload.id);
  }

  @Get('/wasm-files/:id/download')
  async downloadWasmFile(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ) {
    console.log('7. downloadWasmFile');
    return this.invocationService.downloadWasmFile(id, data.payload.id);
  }

  @Patch('')
  @UseInterceptors(
    ResilienceInterceptor(
      new RetryStrategy({
        maxRetries: 5,
      }),
    ),
  )
  update(
    @Body() updateInvocationDto: UpdateInvocationDto,
    @CurrentUser() data: IResponse<User>,
  ): IPromiseResponse<InvocationResponseDto> {
    console.log('8. update');
    return this.invocationService.updateByUser(
      updateInvocationDto,
      data.payload.id,
    );
  }

  @Delete('/:id')
  delete(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
  ): IPromiseResponse<boolean> {
    console.log('9. delete');
    return this.invocationService.deleteByUser(id, data.payload.id);
  }

  @Post('/:id/upload/wasm')
  @UseInterceptors(FileInterceptor('wasm'))
  async uploadWASM(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
    @UploadedFile(WasmFileValidationPipe)
    wasm: Express.Multer.File,
  ): IPromiseResponse<string | ContractErrorResponse> {
    console.log('10. uploadWASM');
    return await this.invocationService.uploadWASM(id, data.payload.id, wasm);
  }

  @Post('/:id/upload/prepare')
  @UseInterceptors(FileInterceptor('wasm'))
  prepareUploadWASM(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
    @UploadedFile(WasmFileValidationPipe)
    wasm: Express.Multer.File,
  ): IPromiseResponse<string | ContractErrorResponse> {
    console.log('11. prepareUploadWASM');
    return this.invocationService.prepareUploadWASM(id, data.payload.id, wasm);
  }

  @Post('/:id/upload/run')
  async runUploadWASM(
    @CurrentUser() data: IResponse<User>,
    @Param('id') id: string,
    @Body()
    {
      signedTransactionXDR,
      deploy = false,
    }: {
      signedTransactionXDR: string;
      deploy: boolean;
    },
  ): Promise<IPromiseResponse<string | ContractErrorResponse>> {
    console.log('12. runUploadWASM');
    return await this.invocationService.runUploadWASM(
      signedTransactionXDR,
      data.payload.id,
      id,
      deploy,
    );
  }
}
