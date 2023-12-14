import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAttributeTypeOfEnvironment1702572347714
  implements MigrationInterface
{
  name = 'UpdateAttributeTypeOfEnvironment1702572347714';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`enviroment\` DROP COLUMN \`value\``);
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` ADD \`value\` text NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`enviroment\` DROP COLUMN \`value\``);
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` ADD \`value\` varchar(255) NOT NULL`,
    );
  }
}
