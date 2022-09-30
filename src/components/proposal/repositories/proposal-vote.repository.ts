import { ProposalVote } from "../../../shared/entities/proposal-vote.entity";
import { EntityRepository, ObjectLiteral, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@EntityRepository(ProposalVote)
export class ProposalVoteRepository extends Repository<ProposalVote> {
    constructor( @InjectRepository(ProposalVote) private readonly repos: Repository<ObjectLiteral>) {
        super();   
    }

    async countVoteByAddress(address: Array<string>){
        const query: string = `SELECT voter, COUNT(1) AS countVote FROM proposal_votes where voter IN (?) GROUP BY  voter`;
        return await this.query(query, [address]);
    }
}