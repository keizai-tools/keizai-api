import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1696953149467 implements MigrationInterface {
  name = 'CreateUserTable1696953149467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`email\` varchar(255) NOT NULL, \`external_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`author\` DROP COLUMN \`first_name\``,
    );
    await queryRunner.query(`ALTER TABLE \`author\` DROP COLUMN \`last_name\``);
    await queryRunner.query(
      `ALTER TABLE \`author\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`author\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`author\` ADD \`firstName\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`author\` ADD \`lastName\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book\` ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book\` ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book\` CHANGE \`format\` \`format\` varchar(255) NOT NULL DEFAULT 'digital'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`book\` CHANGE \`format\` \`format\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`book\` DROP COLUMN \`updated_at\``);
    await queryRunner.query(`ALTER TABLE \`book\` DROP COLUMN \`created_at\``);
    await queryRunner.query(`ALTER TABLE \`author\` DROP COLUMN \`lastName\``);
    await queryRunner.query(`ALTER TABLE \`author\` DROP COLUMN \`firstName\``);
    await queryRunner.query(
      `ALTER TABLE \`author\` DROP COLUMN \`updated_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`author\` DROP COLUMN \`created_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`author\` ADD \`last_name\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`author\` ADD \`first_name\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
  }
}
