import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Task1Tact } from '../wrappers/Task1Tact';
import { Cell, beginCell, toNano } from 'ton-core';
import '@ton-community/test-utils';

function f(i: number, r: Cell[]): Cell {
    let b = beginCell().storeUint(i, 16);
    for (const c of r) {
        b.storeRef(c);
    }
    return b.endCell();
}

describe('Task1Tact', () => {
    let blockchain: Blockchain;
    let task1Tact: SandboxContract<Task1Tact>;

    let c0: Cell, c1: Cell, c3: Cell, c5: Cell, c9: Cell, c11: Cell;

    beforeAll(async () => {
        c3 = f(3, []);
        c9 = f(9, [f(10, [])]);
        c11 = f(11, []);
        c5 = f(5, [f(6, [f(7, [f(8, []), c9])])]);
        c1 = f(1, [f(2, [c3]), f(4, [])]);
        c0 = f(0, [c1, c5, c11]);
    });

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        task1Tact = blockchain.openContract(await Task1Tact.fromInit());

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await task1Tact.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: task1Tact.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task1Tact are ready to use
    });

    it('should not find cells', async () => {
        expect(await task1Tact.getFindBranchByHash(123n, c0)).toEqualCell(Cell.EMPTY);
    });

    it('should find cells', async () => {
        expect(await task1Tact.getFindBranchByHash(BigInt('0x' + c3.hash().toString('hex')), c0)).toEqualCell(c3);
        expect(await task1Tact.getFindBranchByHash(BigInt('0x' + c9.hash().toString('hex')), c0)).toEqualCell(c9);
        expect(await task1Tact.getFindBranchByHash(BigInt('0x' + c11.hash().toString('hex')), c0)).toEqualCell(c11);
        expect(await task1Tact.getFindBranchByHash(BigInt('0x' + c5.hash().toString('hex')), c0)).toEqualCell(c5);
        expect(await task1Tact.getFindBranchByHash(BigInt('0x' + c1.hash().toString('hex')), c0)).toEqualCell(c1);
        expect(await task1Tact.getFindBranchByHash(BigInt('0x' + c0.hash().toString('hex')), c0)).toEqualCell(c0);
    });
});
