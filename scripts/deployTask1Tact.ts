import { toNano } from 'ton-core';
import { Task1Tact } from '../wrappers/Task1Tact';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const task1Tact = provider.open(await Task1Tact.fromInit());

    await task1Tact.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(task1Tact.address);

    // run methods on `task1Tact`
}
