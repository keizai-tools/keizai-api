import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMethodRemoveUserIdTable1709735719025
  implements MigrationInterface
{
  name = 'CreateMethodRemoveUserIdTable1709735719025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`method\` DROP FOREIGN KEY \`FK_c9cc41154cb5ecfd0edcb3b16f4\``,
    );
    await queryRunner.query(`ALTER TABLE \`method\` DROP COLUMN \`user_id\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`method\` ADD \`user_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` ADD CONSTRAINT \`FK_c9cc41154cb5ecfd0edcb3b16f4\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
