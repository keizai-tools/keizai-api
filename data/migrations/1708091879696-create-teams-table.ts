import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamsTable1708091879696 implements MigrationInterface {
  name = 'CreateTeamsTable1708091879696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`team\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`admin_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`team_user\` (\`team_id\` varchar(36) NOT NULL, \`user_id\` varchar(36) NOT NULL, INDEX \`IDX_ed60beadf0e6dffb2b9a5d164e\` (\`team_id\`), INDEX \`IDX_32437794ab1a0519530561ea15\` (\`user_id\`), PRIMARY KEY (\`team_id\`, \`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD \`team_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` ADD UNIQUE INDEX \`IDX_559fc3801cf1e98ca7b9be88cc\` (\`name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD CONSTRAINT \`FK_f8d2f64cb606c9329510b6f5944\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`team_user\` ADD CONSTRAINT \`FK_ed60beadf0e6dffb2b9a5d164e4\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`team_user\` ADD CONSTRAINT \`FK_32437794ab1a0519530561ea159\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`team_user\` DROP FOREIGN KEY \`FK_32437794ab1a0519530561ea159\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`team_user\` DROP FOREIGN KEY \`FK_ed60beadf0e6dffb2b9a5d164e4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP FOREIGN KEY \`FK_f8d2f64cb606c9329510b6f5944\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` DROP INDEX \`IDX_559fc3801cf1e98ca7b9be88cc\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP COLUMN \`team_id\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_32437794ab1a0519530561ea15\` ON \`team_user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ed60beadf0e6dffb2b9a5d164e\` ON \`team_user\``,
    );
    await queryRunner.query(`DROP TABLE \`team_user\``);
    await queryRunner.query(`DROP TABLE \`team\``);
  }
}
