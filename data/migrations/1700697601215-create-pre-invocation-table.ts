import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePreInvocationTable1700697601215
  implements MigrationInterface
{
  name = 'CreatePreInvocationTable1700697601215';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`pre_invocation\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`code\` varchar(255) NOT NULL, \`invocation_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`pre_invocation\` ADD CONSTRAINT \`FK_bc253cc20e73c62561b924efb98\` FOREIGN KEY (\`invocation_id\`) REFERENCES \`invocation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`pre_invocation\` ADD CONSTRAINT \`FK_c69ad748c7040536ef1de4bb29e\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`pre_invocation\` DROP FOREIGN KEY \`FK_c69ad748c7040536ef1de4bb29e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`pre_invocation\` DROP FOREIGN KEY \`FK_bc253cc20e73c62561b924efb98\``,
    );
    await queryRunner.query(`DROP TABLE \`pre_invocation\``);
  }
}
