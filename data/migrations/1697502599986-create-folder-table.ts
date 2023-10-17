import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFolderTable1697502599986 implements MigrationInterface {
  name = 'CreateFolderTable1697502599986';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`folder\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`collection_id\` int NOT NULL, \`user_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD CONSTRAINT \`FK_5d1ee975ba6ecf475306d16c6b2\` FOREIGN KEY (\`collection_id\`) REFERENCES \`collection\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD CONSTRAINT \`FK_b5eabd10f2fe9607e6f5a6ec6bc\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`folder\` DROP FOREIGN KEY \`FK_b5eabd10f2fe9607e6f5a6ec6bc\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` DROP FOREIGN KEY \`FK_5d1ee975ba6ecf475306d16c6b2\``,
    );
    await queryRunner.query(`DROP TABLE \`folder\``);
  }
}
