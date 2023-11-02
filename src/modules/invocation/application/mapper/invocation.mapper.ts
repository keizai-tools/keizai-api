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
      folder,
      id,
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
      contractId,
      folderMapped,
      methodsMapped,
      selectedMethodMapped,
      id,
    );
  }

  fromUpdateDtoToEntity(updateFolderDto: IUpdateInvocationValues): Invocation {
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
