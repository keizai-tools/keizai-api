import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateIndex1729863053121 implements MigrationInterface {
  name = 'UpdateIndex1729863053121';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`email\` varchar(255) NOT NULL, \`external_id\` varchar(255) NOT NULL, \`memo_id\` varchar(255) NULL, \`balance\` int NULL, UNIQUE INDEX \`IDX_cace4a159ff9f2512dd4237376\` (\`id\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), UNIQUE INDEX \`IDX_d9479cbc9c65660b7cf9b65795\` (\`external_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`team\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_f57d8293406df4af348402e4b7\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_role_team\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`role\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`team_id\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_d2a24f2c52d7126468fe30dcfa\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`method\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`invocation_id\` varchar(255) NOT NULL, \`inputs\` json NOT NULL, \`docs\` varchar(255) NULL, \`outputs\` json NOT NULL, \`params\` json NOT NULL, UNIQUE INDEX \`IDX_def6b33cb9809fb4b8ac44c69a\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`invocation\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`secret_key\` varchar(255) NULL, \`public_key\` varchar(255) NULL, \`pre_invocation\` text NULL, \`post_invocation\` text NULL, \`contract_id\` varchar(255) NULL, \`folder_id\` varchar(255) NOT NULL, \`network\` varchar(255) NOT NULL, \`selected_method_id\` varchar(255) NULL, UNIQUE INDEX \`IDX_2299050ee3b3de2eeb08e29355\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`invitation\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`team_id\` varchar(255) NOT NULL, \`from_user_id\` varchar(255) NOT NULL, \`to_user_id\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_beb994737756c0f18a1c1f8669\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`folder\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`collection_id\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_6278a41a706740c94c02e288df\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`enviroment\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`value\` text NOT NULL, \`collection_id\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_e6d2505c581acf8253c5a1345e\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`collection\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`user_id\` varchar(255) NULL, \`team_id\` varchar(255) NULL, UNIQUE INDEX \`IDX_ad3f485bbc99d875491f44d7c8\` (\`id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` ADD CONSTRAINT \`FK_2909195f596442d46f4dce33c9c\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` ADD CONSTRAINT \`FK_633a35d35be5e6516c116aee550\` FOREIGN KEY (\`team_id\`) REFERENCES \`team\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` ADD CONSTRAINT \`FK_a52b9db374922299e58c99b75e3\` FOREIGN KEY (\`invocation_id\`) REFERENCES \`invocation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_21b1dc2cea140f7f9860d3db53f\` FOREIGN KEY (\`folder_id\`) REFERENCES \`folder\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD CONSTRAINT \`FK_7476022a2c5bec2a3a499979e95\` FOREIGN KEY (\`selected_method_id\`) REFERENCES \`method\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`,
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
      `ALTER TABLE \`folder\` ADD CONSTRAINT \`FK_5d1ee975ba6ecf475306d16c6b2\` FOREIGN KEY (\`collection_id\`) REFERENCES \`collection\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`enviroment\` ADD CONSTRAINT \`FK_12a15e5b96016a85ac4bd72d022\` FOREIGN KEY (\`collection_id\`) REFERENCES \`collection\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `ALTER TABLE \`enviroment\` DROP FOREIGN KEY \`FK_12a15e5b96016a85ac4bd72d022\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`folder\` DROP FOREIGN KEY \`FK_5d1ee975ba6ecf475306d16c6b2\``,
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
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_7476022a2c5bec2a3a499979e95\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP FOREIGN KEY \`FK_21b1dc2cea140f7f9860d3db53f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` DROP FOREIGN KEY \`FK_a52b9db374922299e58c99b75e3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` DROP FOREIGN KEY \`FK_633a35d35be5e6516c116aee550\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_role_team\` DROP FOREIGN KEY \`FK_2909195f596442d46f4dce33c9c\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ad3f485bbc99d875491f44d7c8\` ON \`collection\``,
    );
    await queryRunner.query(`DROP TABLE \`collection\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_e6d2505c581acf8253c5a1345e\` ON \`enviroment\``,
    );
    await queryRunner.query(`DROP TABLE \`enviroment\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_6278a41a706740c94c02e288df\` ON \`folder\``,
    );
    await queryRunner.query(`DROP TABLE \`folder\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_beb994737756c0f18a1c1f8669\` ON \`invitation\``,
    );
    await queryRunner.query(`DROP TABLE \`invitation\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_2299050ee3b3de2eeb08e29355\` ON \`invocation\``,
    );
    await queryRunner.query(`DROP TABLE \`invocation\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_def6b33cb9809fb4b8ac44c69a\` ON \`method\``,
    );
    await queryRunner.query(`DROP TABLE \`method\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_d2a24f2c52d7126468fe30dcfa\` ON \`user_role_team\``,
    );
    await queryRunner.query(`DROP TABLE \`user_role_team\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_f57d8293406df4af348402e4b7\` ON \`team\``,
    );
    await queryRunner.query(`DROP TABLE \`team\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_d9479cbc9c65660b7cf9b65795\` ON \`user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_cace4a159ff9f2512dd4237376\` ON \`user\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
  }
}
