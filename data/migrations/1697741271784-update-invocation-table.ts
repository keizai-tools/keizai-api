import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInvocationTable1697741271784 implements MigrationInterface {
  name = 'UpdateInvocationTable1697741271784';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` CHANGE \`method\` \`selected_method_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE \`method\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`invocation_id\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_7476022a2c5bec2a3a499979e95\` FOREIGN KEY (\`selected_method_id\`) REFERENCES \`method\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` ADD CONSTRAINT \`FK_a52b9db374922299e58c99b75e3\` FOREIGN KEY (\`invocation_id\`) REFERENCES \`invocation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` ADD CONSTRAINT \`FK_c9cc41154cb5ecfd0edcb3b16f4\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`method\` DROP FOREIGN KEY \`FK_c9cc41154cb5ecfd0edcb3b16f4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` DROP FOREIGN KEY \`FK_a52b9db374922299e58c99b75e3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_7476022a2c5bec2a3a499979e95\``,
    );
    await queryRunner.query(`DROP TABLE \`method\``);
    await queryRunner.query(
      `ALTER TABLE \`invocation\` CHANGE \`selected_method_id\` \`method\` varchar(255) NOT NULL`,
    );
  }
}
