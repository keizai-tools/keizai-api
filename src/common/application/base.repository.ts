export interface IBaseRepository<T> {
  save(entity: T): Promise<T>;
  findOne(id: string): Promise<T>;
}
