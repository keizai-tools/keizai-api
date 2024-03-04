import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAddRelationTeamRoleUserTable1709560127906
  implements MigrationInterface
{
  name = 'CreateAddRelationTeamRoleUserTable1709560127906';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` DROP FOREIGN KEY \`FK_633a35d35be5e6516c116aee550\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` ADD CONSTRAINT \`FK_633a35d35be5e6516c116aee550\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` DROP FOREIGN KEY \`FK_633a35d35be5e6516c116aee550\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` ADD CONSTRAINT \`FK_633a35d35be5e6516c116aee550\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
