export interface ICollectionValues {
  name: string;
  userId?: string;
  teamId?: string;
}

export interface IUpdateCollectionValues extends ICollectionValues {
  id: string;
}
