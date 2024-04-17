import { Inject, Injectable } from '@nestjs/common';

import { Method } from '@/modules/method/domain/method.domain';

import { StellarMapper } from '../mapper/contract.mapper';
import { IStellarAssetContractService } from '../repository/sac-contract.service';
import { Param, ScVal } from '../types/soroban';
import { IGeneratedMethod } from './contract.service';

@Injectable()
export class StellarAssetContractService
  implements IStellarAssetContractService
{
  private SCSpecTypeMap: { [key: string]: string };
  constructor(
    @Inject(StellarMapper) private readonly stellarMapper: StellarMapper,
  ) {
    this.SCSpecTypeMap = {
      SC_SPEC_TYPE_BOOL: 'b',
      SC_SPEC_TYPE_ERROR: 'error',
      SC_SPEC_TYPE_U32: 'u32',
      SC_SPEC_TYPE_I32: 'i32',
      SC_SPEC_TYPE_U64: 'u64',
      SC_SPEC_TYPE_I64: 'i64',
      SC_SPEC_TYPE_TIMEPOINT: 'timepoint',
      SC_SPEC_TYPE_DURATION: 'duration',
      SC_SPEC_TYPE_U128: 'u128',
      SC_SPEC_TYPE_I128: 'i128',
      SC_SPEC_TYPE_U256: 'u256',
      SC_SPEC_TYPE_I256: 'i256',
      SC_SPEC_TYPE_BYTES: 'bytes',
      SC_SPEC_TYPE_STRING: 'str',
      SC_SPEC_TYPE_SYMBOL: 'sym',
      SC_SPEC_TYPE_ADDRESS: 'address',
      SC_SPEC_TYPE_VEC: 'vec',
      SC_SPEC_TYPE_MAP: 'map',
    };
  }

  getScValFromStellarAssetContract(selectedMethod: Partial<Method>): ScVal[] {
    const params = this.getParamsFromStellarAssetContract(selectedMethod);
    return params.map((param) => this.stellarMapper.getNativeToScVal(param));
  }

  getParamsFromStellarAssetContract(selectedMethod: Partial<Method>): Param[] {
    return selectedMethod.params.map((param) => {
      return {
        value: param.value,
        type: this.SCSpecTypeMap[
          selectedMethod.inputs.find((input) => input.name === param.name).type
        ],
      };
    });
  }

  getStellarAssetContractFunctions(): IGeneratedMethod[] {
    return [
      {
        name: 'allowance',
        docs: null,
        inputs: [
          {
            name: 'from',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'spender',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
      },
      {
        name: 'authorized',
        docs: null,
        inputs: [
          {
            name: 'id',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_BOOL',
          },
        ],
      },
      {
        name: 'approve',
        docs: null,
        inputs: [
          {
            name: 'from',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'spender',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'amount',
            type: 'SC_SPEC_TYPE_I128',
          },
          {
            name: 'expiration_ledger',
            type: 'SC_SPEC_TYPE_I32',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'balance',
        docs: null,
        inputs: [
          {
            name: 'id',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
      },
      {
        name: 'burn',
        docs: null,
        inputs: [
          {
            name: 'from',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'amount',
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'burn_from',
        docs: null,
        inputs: [
          {
            name: 'spender',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'from',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'amount',
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
      },
      {
        name: 'clawback',
        docs: null,
        inputs: [
          {
            name: 'from',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'amount',
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
      },
      {
        name: 'decimals',
        docs: null,
        inputs: [],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'mint',
        docs: null,
        inputs: [
          {
            name: 'to',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'amount',
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'name',
        docs: null,
        inputs: [],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_STRING',
          },
        ],
      },
      {
        name: 'set_admin',
        docs: null,
        inputs: [
          {
            name: 'new_admin',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'admin',
        docs: null,
        inputs: [],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'set_authorized',
        docs: null,
        inputs: [
          {
            name: 'id',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'authorize',
            type: 'SC_SPEC_TYPE_BOOL',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'symbol',
        docs: null,
        inputs: [],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_STRING',
          },
        ],
      },
      {
        name: 'transfer',
        docs: null,
        inputs: [
          {
            name: 'from',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'to',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'amount',
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
      {
        name: 'transfer_from',
        docs: null,
        inputs: [
          {
            name: 'spender',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'from',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'to',
            type: 'SC_SPEC_TYPE_ADDRESS',
          },
          {
            name: 'amount',
            type: 'SC_SPEC_TYPE_I128',
          },
        ],
        outputs: [
          {
            type: 'SC_SPEC_TYPE_RESULT',
          },
        ],
      },
    ];
  }
}
