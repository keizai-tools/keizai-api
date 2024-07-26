import { Inject, forwardRef } from '@nestjs/common';

import {
  FOLDER_MAPPER,
  IFolderMapper,
} from '@/modules/folder/application/interface/folder.mapper.interface';
import {
  IMethodMapper,
  METHOD_MAPPER,
} from '@/modules/method/application/interface/method.mapper.interface';

import { Invocation } from '../../domain/invocation.domain';
import { InvocationResponseDto } from '../dto/invocation-response.dto';
import { UpdateInvocationDto } from '../dto/update-invocation.dto';
import { IInvocationMapper } from '../interface/invocation.mapper.interface';
import {
  IInvocationValues,
  IUpdateInvocationValues,
} from '../interface/invocation.service.interface';

export class InvocationMapper implements IInvocationMapper {
  constructor(
    @Inject(forwardRef(() => FOLDER_MAPPER))
    private readonly folderMapper: IFolderMapper,
    @Inject(METHOD_MAPPER)
    private readonly methodMapper: IMethodMapper,
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
      secretKey: network ? null : secretKey,
      publicKey: network ? null : publicKey,
      preInvocation: network ? null : preInvocation,
      postInvocation: network ? null : postInvocation,
      contractId: network ? null : contractId,
      network,
      folderId,
      selectedMethodId,
      id,
    };
  }
}
