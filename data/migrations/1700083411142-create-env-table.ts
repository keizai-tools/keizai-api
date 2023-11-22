import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnvTable1700083411142 implements MigrationInterface {
  name = 'CreateEnvTable1700083411142';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`enviroment\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`value\` varchar(255) NOT NULL, \`collection_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` ADD CONSTRAINT \`FK_12a15e5b96016a85ac4bd72d022\` FOREIGN KEY (\`collection_id\`) REFERENCES \`collection\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` ADD CONSTRAINT \`FK_dc0b4cb18f3122f04b7fc3327f0\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` DROP FOREIGN KEY \`FK_dc0b4cb18f3122f04b7fc3327f0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` DROP FOREIGN KEY \`FK_12a15e5b96016a85ac4bd72d022\``,
    );
    await queryRunner.query(`DROP TABLE \`enviroment\``);
  }
}
