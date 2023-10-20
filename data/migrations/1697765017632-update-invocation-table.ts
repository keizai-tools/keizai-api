import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInvocationTable1697765017632 implements MigrationInterface {
  name = 'UpdateInvocationTable1697765017632';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`secret_key\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`public_key\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP COLUMN \`public_key\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP COLUMN \`secret_key\``,
    );
  }
}
