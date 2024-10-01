import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDatabaseIndexesAndRelationships1723729481818
  implements MigrationInterface
{
  name = 'UpdateDatabaseIndexesAndRelationships1723729481818';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` DROP FOREIGN KEY \`FK_12a15e5b96016a85ac4bd72d022\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` DROP FOREIGN KEY \`FK_5d1ee975ba6ecf475306d16c6b2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD UNIQUE INDEX \`IDX_ad3f485bbc99d875491f44d7c8\` (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` ADD UNIQUE INDEX \`IDX_e6d2505c581acf8253c5a1345e\` (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_21b1dc2cea140f7f9860d3db53f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD UNIQUE INDEX \`IDX_6278a41a706740c94c02e288df\` (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD UNIQUE INDEX \`IDX_beb994737756c0f18a1c1f8669\` (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` DROP FOREIGN KEY \`FK_a52b9db374922299e58c99b75e3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD UNIQUE INDEX \`IDX_2299050ee3b3de2eeb08e29355\` (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_7476022a2c5bec2a3a499979e95\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` ADD UNIQUE INDEX \`IDX_def6b33cb9809fb4b8ac44c69a\` (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` ADD UNIQUE INDEX \`IDX_d2a24f2c52d7126468fe30dcfa\` (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP FOREIGN KEY \`FK_f8d2f64cb606c9329510b6f5944\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP FOREIGN KEY \`FK_e252ae8906b8e70c59c65e4dcbe\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` DROP FOREIGN KEY \`FK_633a35d35be5e6516c116aee550\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`team\` ADD UNIQUE INDEX \`IDX_f57d8293406df4af348402e4b7\` (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP FOREIGN KEY \`FK_4f925485b013b52e32f43d430f6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP FOREIGN KEY \`FK_38e55bcd5e3166660d4bb827365\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP FOREIGN KEY \`FK_ce35e374df7eb6bcb19f47e15fd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` DROP FOREIGN KEY \`FK_2909195f596442d46f4dce33c9c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_cace4a159ff9f2512dd4237376\` (\`id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_d9479cbc9c65660b7cf9b65795\` (\`external_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD CONSTRAINT \`FK_4f925485b013b52e32f43d430f6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD CONSTRAINT \`FK_f8d2f64cb606c9329510b6f5944\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` ADD CONSTRAINT \`FK_12a15e5b96016a85ac4bd72d022\` FOREIGN KEY (\`collection_id\`) REFERENCES \`collection\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD CONSTRAINT \`FK_5d1ee975ba6ecf475306d16c6b2\` FOREIGN KEY (\`collection_id\`) REFERENCES \`collection\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD CONSTRAINT \`FK_e252ae8906b8e70c59c65e4dcbe\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD CONSTRAINT \`FK_38e55bcd5e3166660d4bb827365\` FOREIGN KEY (\`from_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD CONSTRAINT \`FK_ce35e374df7eb6bcb19f47e15fd\` FOREIGN KEY (\`to_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_21b1dc2cea140f7f9860d3db53f\` FOREIGN KEY (\`folder_id\`) REFERENCES \`folder\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_7476022a2c5bec2a3a499979e95\` FOREIGN KEY (\`selected_method_id\`) REFERENCES \`method\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` ADD CONSTRAINT \`FK_a52b9db374922299e58c99b75e3\` FOREIGN KEY (\`invocation_id\`) REFERENCES \`invocation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` ADD CONSTRAINT \`FK_2909195f596442d46f4dce33c9c\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE \`user_role_team\` DROP FOREIGN KEY \`FK_2909195f596442d46f4dce33c9c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` DROP FOREIGN KEY \`FK_a52b9db374922299e58c99b75e3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_7476022a2c5bec2a3a499979e95\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_21b1dc2cea140f7f9860d3db53f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP FOREIGN KEY \`FK_ce35e374df7eb6bcb19f47e15fd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP FOREIGN KEY \`FK_38e55bcd5e3166660d4bb827365\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP FOREIGN KEY \`FK_e252ae8906b8e70c59c65e4dcbe\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` DROP FOREIGN KEY \`FK_5d1ee975ba6ecf475306d16c6b2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` DROP FOREIGN KEY \`FK_12a15e5b96016a85ac4bd72d022\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP FOREIGN KEY \`FK_f8d2f64cb606c9329510b6f5944\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP FOREIGN KEY \`FK_4f925485b013b52e32f43d430f6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP INDEX \`IDX_d9479cbc9c65660b7cf9b65795\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP INDEX \`IDX_cace4a159ff9f2512dd4237376\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` ADD CONSTRAINT \`FK_2909195f596442d46f4dce33c9c\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD CONSTRAINT \`FK_ce35e374df7eb6bcb19f47e15fd\` FOREIGN KEY (\`to_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD CONSTRAINT \`FK_38e55bcd5e3166660d4bb827365\` FOREIGN KEY (\`from_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD CONSTRAINT \`FK_4f925485b013b52e32f43d430f6\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`team\` DROP INDEX \`IDX_f57d8293406df4af348402e4b7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` ADD CONSTRAINT \`FK_633a35d35be5e6516c116aee550\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` ADD CONSTRAINT \`FK_e252ae8906b8e70c59c65e4dcbe\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` ADD CONSTRAINT \`FK_f8d2f64cb606c9329510b6f5944\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` DROP INDEX \`IDX_d2a24f2c52d7126468fe30dcfa\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` DROP INDEX \`IDX_def6b33cb9809fb4b8ac44c69a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_7476022a2c5bec2a3a499979e95\` FOREIGN KEY (\`selected_method_id\`) REFERENCES \`method\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP INDEX \`IDX_2299050ee3b3de2eeb08e29355\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` ADD CONSTRAINT \`FK_a52b9db374922299e58c99b75e3\` FOREIGN KEY (\`invocation_id\`) REFERENCES \`invocation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invitation\` DROP INDEX \`IDX_beb994737756c0f18a1c1f8669\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` DROP INDEX \`IDX_6278a41a706740c94c02e288df\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_21b1dc2cea140f7f9860d3db53f\` FOREIGN KEY (\`folder_id\`) REFERENCES \`folder\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` DROP INDEX \`IDX_e6d2505c581acf8253c5a1345e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`collection\` DROP INDEX \`IDX_ad3f485bbc99d875491f44d7c8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` ADD CONSTRAINT \`FK_5d1ee975ba6ecf475306d16c6b2\` FOREIGN KEY (\`collection_id\`) REFERENCES \`collection\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` ADD CONSTRAINT \`FK_12a15e5b96016a85ac4bd72d022\` FOREIGN KEY (\`collection_id\`) REFERENCES \`collection\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
