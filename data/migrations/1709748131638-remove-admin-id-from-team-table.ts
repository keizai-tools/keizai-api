import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAdminIdFromTeamTable1709748131638
  implements MigrationInterface
{
  name = 'RemoveAdminIdFromTeamTable1709748131638';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`team\` DROP COLUMN \`admin_id\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`team\` ADD \`admin_id\` varchar(255) NOT NULL`,
    );
  }
}
