import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvitationTable1708376256369 implements MigrationInterface {
  name = 'CreateInvitationTable1708376256369';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`invitation\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`team_id\` varchar(255) NOT NULL, \`from_user_id\` varchar(255) NOT NULL, \`to_user_id\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD CONSTRAINT \`FK_38e55bcd5e3166660d4bb827365\` FOREIGN KEY (\`from_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD CONSTRAINT \`FK_ce35e374df7eb6bcb19f47e15fd\` FOREIGN KEY (\`to_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP FOREIGN KEY \`FK_ce35e374df7eb6bcb19f47e15fd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP FOREIGN KEY \`FK_38e55bcd5e3166660d4bb827365\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` DROP INDEX \`IDX_559fc3801cf1e98ca7b9be88cc\``,
    );
    await queryRunner.query(`DROP TABLE \`invitation\``);
  }
}
