import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTablesId1697667278606 implements MigrationInterface {
  name = 'UpdateTablesId1697667278606';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP FOREIGN KEY \`FK_4f925485b013b52e32f43d430f6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` DROP FOREIGN KEY \`FK_b5eabd10f2fe9607e6f5a6ec6bc\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_122c60a426ba45acc4ee56651ad\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`user\` DROP PRIMARY KEY`);
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book\` DROP FOREIGN KEY \`FK_24b753b0490a992a6941451f405\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`author\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`author\` DROP PRIMARY KEY`);
    await queryRunner.query(`ALTER TABLE \`author\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`author\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`book\` DROP PRIMARY KEY`);
    await queryRunner.query(`ALTER TABLE \`book\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`book\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(`ALTER TABLE \`book\` DROP COLUMN \`author_id\``);
    await queryRunner.query(
      `ALTER TABLE \`book\` ADD \`author_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` DROP FOREIGN KEY \`FK_5d1ee975ba6ecf475306d16c6b2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`collection\` DROP PRIMARY KEY`);
    await queryRunner.query(`ALTER TABLE \`collection\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP COLUMN \`user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD \`user_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_21b1dc2cea140f7f9860d3db53f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`folder\` DROP PRIMARY KEY`);
    await queryRunner.query(`ALTER TABLE \`folder\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` DROP COLUMN \`collection_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD \`collection_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`folder\` DROP COLUMN \`user_id\``);
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD \`user_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`invocation\` DROP PRIMARY KEY`);
    await queryRunner.query(`ALTER TABLE \`invocation\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP COLUMN \`folder_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`folder_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP COLUMN \`user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`user_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book\` ADD CONSTRAINT \`FK_24b753b0490a992a6941451f405\` FOREIGN KEY (\`author_id\`) REFERENCES \`author\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD CONSTRAINT \`FK_4f925485b013b52e32f43d430f6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD CONSTRAINT \`FK_5d1ee975ba6ecf475306d16c6b2\` FOREIGN KEY (\`collection_id\`) REFERENCES \`collection\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD CONSTRAINT \`FK_b5eabd10f2fe9607e6f5a6ec6bc\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
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
    await queryRunner.query(
      `ALTER TABLE \`folder\` DROP FOREIGN KEY \`FK_b5eabd10f2fe9607e6f5a6ec6bc\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` DROP FOREIGN KEY \`FK_5d1ee975ba6ecf475306d16c6b2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP FOREIGN KEY \`FK_4f925485b013b52e32f43d430f6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`book\` DROP FOREIGN KEY \`FK_24b753b0490a992a6941451f405\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP COLUMN \`user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`user_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP COLUMN \`folder_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`folder_id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`invocation\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(`ALTER TABLE \`folder\` DROP COLUMN \`user_id\``);
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD \`user_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` DROP COLUMN \`collection_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD \`collection_id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`folder\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(`ALTER TABLE \`folder\` ADD PRIMARY KEY (\`id\`)`);
    await queryRunner.query(
      `ALTER TABLE \`folder\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_21b1dc2cea140f7f9860d3db53f\` FOREIGN KEY (\`folder_id\`) REFERENCES \`folder\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP COLUMN \`user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD \`user_id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`collection\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD PRIMARY KEY (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD CONSTRAINT \`FK_5d1ee975ba6ecf475306d16c6b2\` FOREIGN KEY (\`collection_id\`) REFERENCES \`collection\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE \`book\` DROP COLUMN \`author_id\``);
    await queryRunner.query(`ALTER TABLE \`book\` ADD \`author_id\` int NULL`);
    await queryRunner.query(`ALTER TABLE \`book\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`book\` ADD \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(`ALTER TABLE \`book\` ADD PRIMARY KEY (\`id\`)`);
    await queryRunner.query(
      `ALTER TABLE \`book\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(`ALTER TABLE \`author\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`author\` ADD \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(`ALTER TABLE \`author\` ADD PRIMARY KEY (\`id\`)`);
    await queryRunner.query(
      `ALTER TABLE \`author\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book\` ADD CONSTRAINT \`FK_24b753b0490a992a6941451f405\` FOREIGN KEY (\`author_id\`) REFERENCES \`author\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(`ALTER TABLE \`user\` ADD PRIMARY KEY (\`id\`)`);
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_122c60a426ba45acc4ee56651ad\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD CONSTRAINT \`FK_b5eabd10f2fe9607e6f5a6ec6bc\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD CONSTRAINT \`FK_4f925485b013b52e32f43d430f6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
