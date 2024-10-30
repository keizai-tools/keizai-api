import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCollectionIdToInvocationAndUniqueIndexesOnUserMigration1730300437513
  implements MigrationInterface
{
  name =
    ' AddCollectionIdToInvocationAndUniqueIndexesOnUserMigration1730300437513';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`collection_id\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_d9479cbc9c65660b7cf9b65795\` (\`external_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_21b1dc2cea140f7f9860d3db53f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` CHANGE \`folder_id\` \`folder_id\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_21b1dc2cea140f7f9860d3db53f\` FOREIGN KEY (\`folder_id\`) REFERENCES \`folder\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_5de148ec12e2b3a3d0613d63419\` FOREIGN KEY (\`collection_id\`) REFERENCES \`collection\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_5de148ec12e2b3a3d0613d63419\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_21b1dc2cea140f7f9860d3db53f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` CHANGE \`folder_id\` \`folder_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_21b1dc2cea140f7f9860d3db53f\` FOREIGN KEY (\`folder_id\`) REFERENCES \`folder\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP INDEX \`IDX_d9479cbc9c65660b7cf9b65795\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP COLUMN \`collection_id\``,
    );
  }
}
