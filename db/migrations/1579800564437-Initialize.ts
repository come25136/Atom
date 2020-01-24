import { MigrationInterface, QueryRunner } from 'typeorm'

export class Initialize1579800564437 implements MigrationInterface {
    name = 'Initialize1579800564437'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `remote` ADD COLUMN `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP() AFTER `id`')
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query('ALTER TABLE `remote` DROP COLUMN `updatedAt`')
    }

}
