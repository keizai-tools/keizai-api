export interface IEnviromentValues {
  name: string;
  value: string;
  collectionId: string;
}

export interface IUpdateEnviromentValues extends Partial<IEnviromentValues> {
  id: string;
}
