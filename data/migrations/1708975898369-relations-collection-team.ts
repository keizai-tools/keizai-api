import { MigrationInterface, QueryRunner } from 'typeorm';

export class RelationsCollectionTeam1708975898369
  implements MigrationInterface
{
  name = 'RelationsCollectionTeam1708975898369';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP FOREIGN KEY \`FK_4f925485b013b52e32f43d430f6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP FOREIGN KEY \`FK_f8d2f64cb606c9329510b6f5944\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` CHANGE \`user_id\` \`user_id\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP COLUMN \`team_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD \`team_id\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD CONSTRAINT \`FK_4f925485b013b52e32f43d430f6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD CONSTRAINT \`FK_f8d2f64cb606c9329510b6f5944\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP FOREIGN KEY \`FK_f8d2f64cb606c9329510b6f5944\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP FOREIGN KEY \`FK_4f925485b013b52e32f43d430f6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP COLUMN \`team_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD \`team_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` CHANGE \`user_id\` \`user_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD CONSTRAINT \`FK_f8d2f64cb606c9329510b6f5944\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD CONSTRAINT \`FK_4f925485b013b52e32f43d430f6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
