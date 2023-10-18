import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateParamsTable1697667282093 implements MigrationInterface {
  name = 'CreateParamsTable1697667282093';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`param\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`value\` varchar(255) NOT NULL, \`invocation_id\` int NOT NULL, \`user_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`param\` ADD CONSTRAINT \`FK_10a136bc0a6a238322b0357d09e\` FOREIGN KEY (\`invocation_id\`) REFERENCES \`invocation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`param\` ADD CONSTRAINT \`FK_6eac2dfeee8058b17f0d2c80302\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`param\` DROP FOREIGN KEY \`FK_6eac2dfeee8058b17f0d2c80302\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`param\` DROP FOREIGN KEY \`FK_10a136bc0a6a238322b0357d09e\``,
    );
    await queryRunner.query(`DROP TABLE \`param\``);
  }
}
