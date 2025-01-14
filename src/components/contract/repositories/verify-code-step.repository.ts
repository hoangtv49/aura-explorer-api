import { EntityRepository, Repository } from 'typeorm';
import { VerifyCodeStep } from '../../../shared/entities/verify-code-step.entity';
import { VerifyItemCheck } from '../../../shared/entities/verify-item-check.entity';

@EntityRepository(VerifyCodeStep)
export class VerifyCodeStepRepository extends Repository<VerifyCodeStep> {
  async getVerifyCodeStep(codeId: number) {
    return await this.createQueryBuilder('cs')
      .select(`cs.*, ic.check_name, ic.group_stage`)
      .leftJoin(VerifyItemCheck, 'ic', 'cs.check_id=ic.id')
      .where('cs.code_id = :code_id', {
        code_id: codeId,
      })
      .getRawMany();
  }
}
