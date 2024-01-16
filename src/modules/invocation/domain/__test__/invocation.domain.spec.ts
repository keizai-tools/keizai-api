import { Invocation } from '../invocation.domain';

describe('Invocation', () => {
  let invocation;
  describe('Get ContractId Value', () => {
    beforeEach(() => {
      invocation = new Invocation(
        'Invocation',
        '',
        '',
        '',
        '',
        '',
        'futurenet',
        'folderId',
        'userId',
      );
    });
    it('Should return the variable name without {{ }}', () => {
      const envContractId = '{{contract_id}}';
      const expectedValue = 'contract_id';
      const contractId = invocation.getContractIdValue(envContractId);

      expect(contractId).toEqual(expectedValue);
    });
  });
});
