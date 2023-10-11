export interface IBaseRepository<T> {
  save(entity: T): Promise<T>;
  findOne(id: number): Promise<T>;
}
