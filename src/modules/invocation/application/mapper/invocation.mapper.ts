import { Inject, forwardRef } from '@nestjs/common';

import { FolderMapper } from '@/modules/folder/application/mapper/folder.mapper';
import { MethodMapper } from '@/modules/method/application/mapper/method.mapper';

import { Invocation } from '../../domain/invocation.domain';
import { InvocationResponseDto } from '../dto/invocation-response.dto';
import {
  IInvocationValues,
  IUpdateInvocationValues,
} from '../service/invocation.service';

export class InvocationMapper {
  constructor(
    @Inject(forwardRef(() => FolderMapper))
    private readonly folderMapper: FolderMapper,
    @Inject(MethodMapper)
    private readonly methodMapper: MethodMapper,
  ) {}

  fromDtoToEntity(createInvocationDto: IInvocationValues): Invocation {
    const {
      name,
      secretKey,
      publicKey,
      preInvocation,
      postInvocation,
      contractId,
      folderId,
      userId,
      network,
    } = createInvocationDto;
    return new Invocation(
      name,
      secretKey,
      publicKey,
      preInvocation,
      postInvocation,
      contractId,
      folderId,
      userId,
      network,
    );
  }

  fromEntityToDto(invocation: Invocation): InvocationResponseDto {
    const {
      name,
      secretKey,
      publicKey,
      preInvocation,
      postInvocation,
      contractId,
      folder,
      id,
      network,
      methods,
      selectedMethod,
    } = invocation;

    const methodsMapped = methods?.map((method) =>
      this.methodMapper.fromEntityToDto(method),
    );

    const selectedMethodMapped =
      selectedMethod && this.methodMapper.fromEntityToDto(selectedMethod);

    const folderMapped = folder && this.folderMapper.fromEntityToDto(folder);

    return new InvocationResponseDto(
      name,
      secretKey,
      publicKey,
      preInvocation,
      postInvocation,
      contractId,
      network,
      folderMapped,
      methodsMapped,
      selectedMethodMapped,
      id,
    );
  }

  fromUpdateDtoToEntity(
    updateInvocationDto: IUpdateInvocationValues,
  ): Invocation {
    const {
      name,
      secretKey,
      publicKey,
      preInvocation,
      postInvocation,
      contractId,
      network,
      folderId,
      selectedMethodId,
      id,
      userId,
    } = updateInvocationDto;
    return new Invocation(
      name,
      secretKey,
      publicKey,
      preInvocation,
      postInvocation,
      contractId,
      folderId,
      userId,
      network,
      selectedMethodId,
      id,
    );
  }
}
