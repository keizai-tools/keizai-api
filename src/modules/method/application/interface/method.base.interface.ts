export interface IMethodValues {
  name: string;
  inputs: { name: string; type: string }[];
  outputs: { type: string }[];
  params?: { name: string; value: string }[];
  docs: string;
  invocationId: string;
}

export interface IUpdateMethodValues extends Partial<IMethodValues> {
  id: string;
}
