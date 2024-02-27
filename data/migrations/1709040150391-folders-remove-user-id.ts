import { MigrationInterface, QueryRunner } from 'typeorm';

export class FoldersRemoveUserId1709040150391 implements MigrationInterface {
  name = 'FoldersRemoveUserId1709040150391';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`folder\` DROP FOREIGN KEY \`FK_b5eabd10f2fe9607e6f5a6ec6bc\``,
    );
    await queryRunner.query(`ALTER TABLE \`folder\` DROP COLUMN \`user_id\``);
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD CONSTRAINT \`FK_e252ae8906b8e70c59c65e4dcbe\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP FOREIGN KEY \`FK_e252ae8906b8e70c59c65e4dcbe\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD \`user_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD CONSTRAINT \`FK_b5eabd10f2fe9607e6f5a6ec6bc\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
