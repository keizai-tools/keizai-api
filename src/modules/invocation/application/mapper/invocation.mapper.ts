import { Inject, forwardRef } from '@nestjs/common';

import { FolderMapper } from '@/modules/folder/application/mapper/folder.mapper';
import { MethodMapper } from '@/modules/method/application/mapper/method.mapper';

import { Invocation } from '../../domain/invocation.domain';
import { InvocationResponseDto } from '../dto/invocation-response.dto';
import { UpdateInvocationDto } from '../dto/update-invocation.dto';
import {
  IInvocationValues,
  IUpdateInvocationValues,
} from '../interface/invocation.base.interface';

export class InvocationMapper {
  constructor(
    @Inject(forwardRef(() => FolderMapper))
    private readonly folderMapper: FolderMapper,
    @Inject(forwardRef(() => MethodMapper))
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
      network,
      collectionId,
    } = createInvocationDto;
    return new Invocation(
      name,
      secretKey,
      publicKey,
      preInvocation,
      postInvocation,
      contractId,
      folderId,
      network,
      collectionId,
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
      folderId,
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
      folderId,
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
      collectionId,
      folderId,
      selectedMethodId,
      id,
    } = updateInvocationDto;
    return new Invocation(
      name,
      secretKey,
      publicKey,
      preInvocation,
      postInvocation,
      contractId,
      folderId,
      network,
      collectionId,
      selectedMethodId,
      id,
    );
  }
  fromUpdateDtoToInvocationValues(
    updateInvocationDto: UpdateInvocationDto,
  ): IUpdateInvocationValues {
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
    } = updateInvocationDto;
    return {
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
    };
  }
}
