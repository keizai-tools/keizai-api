import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvocationTable1697586916610 implements MigrationInterface {
  name = 'CreateInvocationTable1697586916610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`invocation\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`method\` varchar(255) NOT NULL, \`contract_id\` varchar(255) NOT NULL, \`folder_id\` int NOT NULL, \`user_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_21b1dc2cea140f7f9860d3db53f\` FOREIGN KEY (\`folder_id\`) REFERENCES \`folder\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_122c60a426ba45acc4ee56651ad\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_122c60a426ba45acc4ee56651ad\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_21b1dc2cea140f7f9860d3db53f\``,
    );
    await queryRunner.query(`DROP TABLE \`invocation\``);
  }
}
