import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEnvironmentConstraints1733975328495
  implements MigrationInterface
{
  name = ' UpdateEnvironmentConstraints1733975328495';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`environment\` DROP FOREIGN KEY \`FK_12a15e5b96016a85ac4bd72d022\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e6d2505c581acf8253c5a1345e\` ON \`environment\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`environment\` ADD UNIQUE INDEX \`IDX_f0ec97d0ac5e0e2f50f7475699\` (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`environment\` ADD CONSTRAINT \`FK_f3b71df58fd9fced0b92051138f\` FOREIGN KEY (\`collection_id\`) REFERENCES \`collection\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`environment\` DROP FOREIGN KEY \`FK_f3b71df58fd9fced0b92051138f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`environment\` DROP INDEX \`IDX_f0ec97d0ac5e0e2f50f7475699\``,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_e6d2505c581acf8253c5a1345e\` ON \`environment\` (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`environment\` ADD CONSTRAINT \`FK_12a15e5b96016a85ac4bd72d022\` FOREIGN KEY (\`collection_id\`) REFERENCES \`collection\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
