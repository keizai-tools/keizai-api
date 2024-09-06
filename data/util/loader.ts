import { resolve } from 'path';
import { DataSource } from 'typeorm';
import {
  Builder,
  IEntity,
  Loader,
  Parser,
  Resolver,
  fixturesIterator,
} from 'typeorm-fixtures-cli';
import { CommandUtils } from 'typeorm/commands/CommandUtils';

export async function loadFixtures({
  fixturesPath,
  dataSourcePath,
}: {
  fixturesPath: string;
  dataSourcePath: string;
}): Promise<void> {
  let dataSource: DataSource | undefined = undefined;

  try {
    dataSource = await CommandUtils.loadDataSource(dataSourcePath);
    await dataSource.initialize();
    await dataSource.synchronize(true);

    const loader = new Loader();
    loader.load(resolve(fixturesPath));

    const resolver = new Resolver();
    const fixtures = resolver.resolve(loader.fixtureConfigs);
    const builder = new Builder(dataSource, new Parser(), false);

    for (const fixture of fixturesIterator(fixtures)) {
      const entity: IEntity = await builder.build(fixture);
      await dataSource.getRepository(fixture.entity).save(entity);
    }
  } finally {
    if (dataSource) {
      await dataSource.destroy();
    }
  }
}
