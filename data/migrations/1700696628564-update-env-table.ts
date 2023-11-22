import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEnvTable1700696628564 implements MigrationInterface {
  name = 'UpdateEnvTable1700696628564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`enviroment\` DROP COLUMN \`type\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` ADD \`type\` varchar(255) NOT NULL`,
    );
  }
}
