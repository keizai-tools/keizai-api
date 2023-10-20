import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateToNullableInvocationTable1697771713813
  implements MigrationInterface
{
  name = 'UpdateToNullableInvocationTable1697771713813';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` CHANGE \`secret_key\` \`secret_key\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` CHANGE \`public_key\` \`public_key\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` CHANGE \`contract_id\` \`contract_id\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` CHANGE \`contract_id\` \`contract_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` CHANGE \`public_key\` \`public_key\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` CHANGE \`secret_key\` \`secret_key\` varchar(255) NOT NULL`,
    );
  }
}
