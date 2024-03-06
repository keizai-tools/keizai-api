import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvocationRemoveUserIdTable1709734863754
  implements MigrationInterface
{
  name = 'CreateInvocationRemoveUserIdTable1709734863754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_122c60a426ba45acc4ee56651ad\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP COLUMN \`user_id\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`user_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_122c60a426ba45acc4ee56651ad\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
