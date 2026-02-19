import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReadService } from 'src/modules/read/read.service';
import { FileReaderFactory } from 'src/modules/read/strategies/file-reader-factory';

describe('ReadService', () => {
  let service: ReadService;
  let factory: jest.Mocked<FileReaderFactory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadService,
        {
          provide: FileReaderFactory,
          useValue: {
            getStrategy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReadService>(ReadService);
    factory = module.get(FileReaderFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if no file is provided', async () => {
    await expect(service.read(undefined as any)).rejects.toThrow(
      new BadRequestException('No file uploaded.'),
    );
  });

  it('should throw if unsupported file type', async () => {
    factory.getStrategy.mockReturnValueOnce(undefined);

    const fakeFile = {
      originalname: 'image.jpg',
      buffer: Buffer.from('fake-data'),
    } as Express.Multer.File;

    await expect(service.read(fakeFile)).rejects.toThrow(
      new BadRequestException('Unsupported file type: jpg'),
    );
  });

  it('should read file successfully with valid strategy', async () => {
    const mockText = 'Hello, world!';
    const mockStrategy = { read: jest.fn().mockResolvedValue(mockText) };
    factory.getStrategy.mockReturnValueOnce(mockStrategy as any);

    const fakeFile = {
      originalname: 'document.txt',
      buffer: Buffer.from('Some text'),
    } as Express.Multer.File;

    const result = await service.read(fakeFile);

    expect(factory.getStrategy).toHaveBeenCalledWith('txt');
    expect(mockStrategy.read).toHaveBeenCalledWith(fakeFile.buffer);
    expect(result).toBe(mockText);
  });
});
