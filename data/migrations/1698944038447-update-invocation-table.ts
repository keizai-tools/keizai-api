import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInvocationTable1698944038447 implements MigrationInterface {
  name = 'UpdateInvocationTable1698944038447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_7476022a2c5bec2a3a499979e95\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_7476022a2c5bec2a3a499979e95\` FOREIGN KEY (\`selected_method_id\`) REFERENCES \`method\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_7476022a2c5bec2a3a499979e95\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_7476022a2c5bec2a3a499979e95\` FOREIGN KEY (\`selected_method_id\`) REFERENCES \`method\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
