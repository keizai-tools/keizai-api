import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropParamTable1698283516947 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`param\` DROP FOREIGN KEY \`FK_6eac2dfeee8058b17f0d2c80302\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`param\` DROP FOREIGN KEY \`FK_10a136bc0a6a238322b0357d09e\``,
    );
    await queryRunner.query(`DROP TABLE \`param\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`param\``);
    await queryRunner.query(
      `ALTER TABLE \`param\` ADD CONSTRAINT \`FK_10a136bc0a6a238322b0357d09e\` FOREIGN KEY (\`invocation_id\`) REFERENCES \`invocation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`param\` ADD CONSTRAINT \`FK_6eac2dfeee8058b17f0d2c80302\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
