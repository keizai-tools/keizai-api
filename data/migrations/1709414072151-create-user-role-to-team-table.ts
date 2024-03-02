import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserRoleToTeamTable1709414072151
  implements MigrationInterface
{
  name = 'CreateUserRoleToTeamTable1709414072151';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_role_team\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`role\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`team_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD CONSTRAINT \`FK_e252ae8906b8e70c59c65e4dcbe\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` ADD CONSTRAINT \`FK_2909195f596442d46f4dce33c9c\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` ADD CONSTRAINT \`FK_633a35d35be5e6516c116aee550\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` DROP FOREIGN KEY \`FK_633a35d35be5e6516c116aee550\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` DROP FOREIGN KEY \`FK_2909195f596442d46f4dce33c9c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP FOREIGN KEY \`FK_e252ae8906b8e70c59c65e4dcbe\``,
    );
    await queryRunner.query(`DROP TABLE \`user_role_team\``);
  }
}
