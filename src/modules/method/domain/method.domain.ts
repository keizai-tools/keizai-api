import { Base } from '@/common/domain/base.domain';
import { User } from '@/modules/auth/domain/user.domain';
import { Invocation } from '@/modules/invocation/domain/invocation.domain';

export class Method extends Base {
  name: string;
  inputs: { name: string; type: string }[];
  outputs: { type: string }[];
  params: { name: string; value: string }[];
  docs?: string;
  invocationId?: string;
  userId?: string;
  user?: User;
  invocation?: Invocation;

  constructor(
    name: string,
    inputs: { name: string; type: string }[],
    outputs: { type: string }[],
    params: { name: string; value: string }[],
    docs: string,
    invocationId?: string,
    userId?: string,
    id?: string,
  ) {
    super();
    this.name = name;
    this.inputs = inputs;
    this.outputs = outputs;
    this.params = params;
    this.docs = docs;
    this.invocationId = invocationId;
    this.userId = userId;
    this.id = id;
  }

  getParamValue(paramValue: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    try {
      const matches: string[] = paramValue.match(regex) || [];
      return matches.length > 0 && matches.map((match) => match.slice(2, -2));
    } catch (error) {
      return [];
    }
  }

  replaceParamValue(
    paramsValues: { name: string; value: string }[],
    inputString: string,
  ) {
    const variableMap: { [key: string]: string } = {};

    paramsValues.forEach((variable) => {
      variableMap[variable.name] = variable.value;
    });

    const regex = /\{\{([^}]+)\}\}/g;
    inputString = inputString.replace(regex, (match, variableName) => {
      return variableMap[variableName] || match;
    });

    return inputString;
  }
}
