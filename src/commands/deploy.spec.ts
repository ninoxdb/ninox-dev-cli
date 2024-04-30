import {Command} from 'commander';
import {run} from '@handlers/deploy-handler';
import {mocked} from 'jest-mock';
import {Credentials} from '@common/typings';

jest.mock('@handlers/deploy-handler');

const mockedRun = mocked(run);

describe('deploy command', () => {
    beforeEach(() => {
        mockedRun.mockClear();
    });

    it('calls run with correct options', async () => {
        const options = {
            id: 'testId',
            type: 'testType',
            domain: 'testDomain',
            workspaceId: 'testWorkspaceId',
            apiKey: 'testApiKey'
        };

        const environment = {
            apiKey: 'testApiKey',
            domain: 'testDomain',
            workspaceId: 'testWorkspaceId'
        } as Credentials;

        const deploy = new Command();
        deploy
                .option('-id, --id <id>', 'Object ID')
                .option('-t, --type <type>', 'Object Type e.g Database, Table, View, Field')
                .option('-d, --domain <domain>', 'Domain')
                .option('-w, --workspaceId <workspaceId>', 'Workspace ID')
                .option('-k, --apiKey <API Key>', 'API Key')
                .action(async (opts) => {
                    await run(opts, environment);
                });

        deploy.parseAsync(['node', 'test', '--id', options.id, '--type', options.type, '--domain', options.domain, '--workspaceId', options.workspaceId, '--apiKey', options.apiKey]);

        expect(mockedRun).toHaveBeenCalledWith(options, environment);
    });
});