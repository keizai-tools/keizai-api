import { Invocation } from '../invocation.domain';

describe('Product domain', () => {
  describe('validatePreInvocation', () => {
    it('should run correctly', () => {
      const invocation = new Invocation(
        'invocation',
        'secretKey',
        'publicKey',
        'function b(){return "a"}; b()',
        'contractId',
        'folderId',
        'userId',
      );
      const preInvocationValue = invocation.validatePreInvocation(
        invocation.preInvocation,
      );
      expect(preInvocationValue).toEqual('a');
    });
  });
});
