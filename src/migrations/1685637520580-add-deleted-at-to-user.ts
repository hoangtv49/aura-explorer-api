import {MigrationInterface, QueryRunner} from "typeorm";

export class addDeletedAtToUser1685637520580 implements MigrationInterface {
    name = 'addDeletedAtToUser1685637520580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`deletedAt\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`deletedAt\``);
    }

}
