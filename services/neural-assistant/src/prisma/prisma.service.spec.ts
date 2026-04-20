import { PrismaService } from '../../prisma/prisma.service';

describe('PrismaService read-only guards', () => {
  const prismaProto = PrismaService.prototype as unknown as {
    registerReadOnlyGuards: () => void;
    blockWriteMethods: (
      delegateName: 'document' | 'documentChunk',
      modelName: 'Document' | 'DocumentChunk',
    ) => void;
  };

  it('registerReadOnlyGuards should register middleware when $use exists', async () => {
    const middlewares: Array<(params: any, next: (params: any) => Promise<any>) => Promise<any>> =
      [];
    const fakeClient = {
      $use: (mw: (params: any, next: (params: any) => Promise<any>) => Promise<any>) => {
        middlewares.push(mw);
      },
      blockWriteMethods: jest.fn(),
    };

    prismaProto.registerReadOnlyGuards.call(fakeClient);

    expect(middlewares).toHaveLength(1);
    expect(fakeClient.blockWriteMethods).not.toHaveBeenCalled();

    const next = jest.fn(() => Promise.resolve('ok'));
    await expect(middlewares[0]({ model: 'Document', action: 'update' }, next)).rejects.toThrow(
      'Write operation "update" on "Document" is blocked in neural-assistant.',
    );
    expect(next).not.toHaveBeenCalled();

    await expect(middlewares[0]({ model: 'Document', action: 'findMany' }, next)).resolves.toBe(
      'ok',
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('registerReadOnlyGuards should fallback to delegate patching when $use is missing', () => {
    const fakeClient = {
      blockWriteMethods: jest.fn(),
    };

    prismaProto.registerReadOnlyGuards.call(fakeClient);

    expect(fakeClient.blockWriteMethods).toHaveBeenCalledTimes(2);
    expect(fakeClient.blockWriteMethods).toHaveBeenNthCalledWith(1, 'document', 'Document');
    expect(fakeClient.blockWriteMethods).toHaveBeenNthCalledWith(
      2,
      'documentChunk',
      'DocumentChunk',
    );
  });

  it('blockWriteMethods should block writes and keep reads untouched', async () => {
    const readResult = [{ id: 'doc-1' }];
    const fakeClient = {
      document: {
        create: jest.fn(() => Promise.resolve({ id: 'new-doc' })),
        findMany: jest.fn(() => Promise.resolve(readResult)),
      },
    };

    prismaProto.blockWriteMethods.call(fakeClient, 'document', 'Document');

    await expect(fakeClient.document.findMany()).resolves.toEqual(readResult);
    await expect(fakeClient.document.create()).rejects.toThrow(
      'Write operation "create" on "Document" is blocked in neural-assistant.',
    );
  });
});
