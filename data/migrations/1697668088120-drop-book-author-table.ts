import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropBookAuthorTable1697668088120 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`book\` DROP FOREIGN KEY \`FK_24b753b0490a992a6941451f405\``,
    );
    await queryRunner.query(`DROP TABLE \`author\``);
    await queryRunner.query(`DROP TABLE \`book\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`author\``);
    await queryRunner.query(`CREATE TABLE \`book\``);
  }
}
