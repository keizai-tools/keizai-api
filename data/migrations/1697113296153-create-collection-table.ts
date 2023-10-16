import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCollectionTable1697113296153 implements MigrationInterface {
  name = 'CreateCollectionTable1697113296153';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`collection\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`user_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD CONSTRAINT \`FK_4f925485b013b52e32f43d430f6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP FOREIGN KEY \`FK_4f925485b013b52e32f43d430f6\``,
    );
    await queryRunner.query(`DROP TABLE \`collection\``);
  }
}
