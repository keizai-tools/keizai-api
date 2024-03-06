import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnvironmentRemoveUserIdTable1709736183960
  implements MigrationInterface
{
  name = 'CreateEnvironmentRemoveUserIdTable1709736183960';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` DROP FOREIGN KEY \`FK_dc0b4cb18f3122f04b7fc3327f0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` DROP COLUMN \`user_id\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` ADD \`user_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` ADD CONSTRAINT \`FK_dc0b4cb18f3122f04b7fc3327f0\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
