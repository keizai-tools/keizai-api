import { MigrationInterface, QueryRunner } from 'typeorm';

export class InvocationsRemoveUserId1709045674766
  implements MigrationInterface
{
  name = 'InvocationsRemoveUserId1709045674766';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_122c60a426ba45acc4ee56651ad\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP COLUMN \`user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD CONSTRAINT \`FK_e252ae8906b8e70c59c65e4dcbe\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP FOREIGN KEY \`FK_e252ae8906b8e70c59c65e4dcbe\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`user_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_122c60a426ba45acc4ee56651ad\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
