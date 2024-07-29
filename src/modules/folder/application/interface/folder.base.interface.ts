export interface IFolderValues {
  name: string;
  collectionId: string;
}

export interface IUpdateFolderValues extends Partial<IFolderValues> {
  id: string;
}
