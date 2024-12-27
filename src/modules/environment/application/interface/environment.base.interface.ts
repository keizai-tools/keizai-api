export interface IEnvironmentValues {
  name: string;
  value: string;
  collectionId: string;
}

export interface IUpdateEnvironmentValues extends Partial<IEnvironmentValues> {
  id: string;
}
