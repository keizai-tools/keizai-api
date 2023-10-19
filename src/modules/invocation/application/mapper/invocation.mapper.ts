import { Inject } from '@nestjs/common';

import { MethodMapper } from '@/modules/method/application/mapper/method.mapper';
import { ParamMapper } from '@/modules/parameter/application/mapper/param.mapper';

import { Invocation } from '../../domain/invocation.domain';
import { InvocationResponseDto } from '../dto/invocation-response.dto';
import { IInvocationValues } from '../service/invocation.service';

export class InvocationMapper {
  constructor(
    @Inject(ParamMapper)
    private readonly paramMapper: ParamMapper,
    @Inject(MethodMapper)
    private readonly methodMapper: MethodMapper,
  ) {}

  fromDtoToEntity(createFolderDto: IInvocationValues): Invocation {
    const { name, secretKey, publicKey, contractId, folderId, userId } =
      createFolderDto;
    return new Invocation(
      name,
      secretKey,
      publicKey,
      contractId,
      folderId,
      userId,
    );
  }

  fromEntityToDto(invocation: Invocation): InvocationResponseDto {
    const {
      name,
      secretKey,
      publicKey,
      contractId,
      params,
      id,
      methods,
      selectedMethod,
    } = invocation;

    const methodsMapped = methods?.map((method) =>
      this.methodMapper.fromEntityToDto(method),
    );

    const selectedMethodMapped = selectedMethod
      ? this.methodMapper.fromEntityToDto(selectedMethod)
      : null;

    const paramsMapped = params?.map((param) =>
      this.paramMapper.fromEntityToDto(param),
    );
    return new InvocationResponseDto(
      name,
      secretKey,
      publicKey,
      contractId,
      paramsMapped,
      methodsMapped,
      selectedMethodMapped,
      id,
    );
  }

  fromUpdateDtoToEntity(updateFolderDto: IInvocationValues): Invocation {
    const {
      name,
      secretKey,
      publicKey,
      contractId,
      folderId,
      selectedMethodId,
      id,
      userId,
    } = updateFolderDto;
    return new Invocation(
      name,
      secretKey,
      publicKey,
      contractId,
      folderId,
      userId,
      selectedMethodId,
      id,
    );
  }
}
