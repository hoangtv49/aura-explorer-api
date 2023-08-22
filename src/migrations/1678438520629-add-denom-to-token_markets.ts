import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDenomToTokenMarket1678438520629 implements MigrationInterface {
  name = 'addDenomToTokenMarket1678438520629';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` ADD \`denom\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`token_markets\` DROP COLUMN \`denom\``,
    );
  }
}
