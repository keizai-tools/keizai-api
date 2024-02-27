import { MigrationInterface, QueryRunner } from 'typeorm';

export class MethodsRemoveUserId1709047371166 implements MigrationInterface {
  name = 'MethodsRemoveUserId1709047371166';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`method\` DROP FOREIGN KEY \`FK_c9cc41154cb5ecfd0edcb3b16f4\``,
    );
    await queryRunner.query(`ALTER TABLE \`method\` DROP COLUMN \`user_id\``);
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD CONSTRAINT \`FK_e252ae8906b8e70c59c65e4dcbe\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP FOREIGN KEY \`FK_e252ae8906b8e70c59c65e4dcbe\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` ADD \`user_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` ADD CONSTRAINT \`FK_c9cc41154cb5ecfd0edcb3b16f4\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
