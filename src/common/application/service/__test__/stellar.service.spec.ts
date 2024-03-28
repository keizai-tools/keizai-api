/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { xdr } from 'stellar-sdk';

import { MethodMapper } from '@/modules/method/application/mapper/method.mapper';

import { StellarMapper } from '../../mapper/contract.mapper';
import { CONTRACT_EXECUTABLE_TYPE, NETWORK } from '../../types/soroban.enum';
import { StellarService } from '../stellar.service';

const contractExecutable: xdr.ContractExecutable = {
  switch: jest.fn(),
  wasmHash: jest.fn(),
  value: jest.fn(),
  toXDR: jest.fn(),
};

describe('StellarService', () => {
  let service: StellarService;
  let methodMapper: MethodMapper;
  let stellarMapper: StellarMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StellarService, MethodMapper, StellarMapper],
    }).compile();

    service = module.get<StellarService>(StellarService);
    methodMapper = module.get<MethodMapper>(MethodMapper);
    stellarMapper = module.get<StellarMapper>(StellarMapper);
  });

  describe('verifyNetwork', () => {
    it('Should not change the network if selectedNetwork is the same as the current network', () => {
      const changeNetworkSpy = jest.spyOn(service, 'changeNetwork');

      const selectedNetwork = NETWORK.SOROBAN_FUTURENET;
      service.verifyNetwork(selectedNetwork);

      expect(changeNetworkSpy).not.toHaveBeenCalled();
    });

    it('Should change the network if selectedNetwork is different from the current network', () => {
      const changeNetworkSpy = jest.spyOn(service, 'changeNetwork');

      const selectedNetwork = NETWORK.SOROBAN_TESTNET;
      service.verifyNetwork(selectedNetwork);

      expect(changeNetworkSpy).toHaveBeenCalledWith(selectedNetwork);
      expect(changeNetworkSpy).toHaveBeenCalledTimes(1);
    });
  });
  describe('generateMethodsFromContractId', () => {
    it('Should return the stellar asset contract functions', async () => {
      jest
        .spyOn(service, 'getInstanceValue')
        .mockResolvedValue(contractExecutable);
      jest.spyOn(contractExecutable, 'switch').mockReturnValue({
        name: CONTRACT_EXECUTABLE_TYPE.STELLAR_ASSET,
        value: 1,
      });
      jest
        .spyOn(service, 'getStellarAssetContractFunctions')
        .mockReturnValue([]);
      jest.spyOn(service, 'getContractSpecEntries');

      const result = await service.generateMethodsFromContractId('contractId');

      expect(service.getInstanceValue).toHaveBeenCalled();
      expect(service.getStellarAssetContractFunctions).toHaveBeenCalled();
      expect(service.getContractSpecEntries).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
    it('Should return the smart contract functions', async () => {
      jest
        .spyOn(service, 'getInstanceValue')
        .mockResolvedValue(contractExecutable);
      jest.spyOn(contractExecutable, 'switch').mockReturnValue({
        name: CONTRACT_EXECUTABLE_TYPE.WASM,
        value: 0,
      });
      jest.spyOn(service, 'getStellarAssetContractFunctions');
      jest.spyOn(service, 'getContractSpecEntries').mockResolvedValue([]);
      jest.spyOn(service, 'extractFunctionInfo').mockReturnValue({
        name: '',
        docs: '',
        inputs: [],
        outputs: [],
      });

      const result = await service.generateMethodsFromContractId('contractId');

      expect(service.getInstanceValue).toHaveBeenCalled();
      expect(service.getStellarAssetContractFunctions).not.toHaveBeenCalled();
      expect(service.getContractSpecEntries).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
