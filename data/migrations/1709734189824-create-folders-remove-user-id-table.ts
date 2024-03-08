import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFoldersRemoveUserIdTable1709734189824
  implements MigrationInterface
{
  name = 'CreateFoldersRemoveUserIdTable1709734189824';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`folder\` DROP FOREIGN KEY \`FK_b5eabd10f2fe9607e6f5a6ec6bc\``,
    );
    await queryRunner.query(`ALTER TABLE \`folder\` DROP COLUMN \`user_id\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD \`user_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD CONSTRAINT \`FK_b5eabd10f2fe9607e6f5a6ec6bc\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
