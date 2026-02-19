import { Test, TestingModule } from '@nestjs/testing';
import { PdfReaderStrategy } from './pdf.strategy';
import { DocxReaderStrategy } from './docx.strategy';
import { TxtReaderStrategy } from './txt.strategy';
import { FileReaderFactory } from 'src/modules/read/strategies/file-reader-factory';

describe('FileReaderFactory', () => {
  let factory: FileReaderFactory;
  let pdfStrategy: PdfReaderStrategy;
  let docxStrategy: DocxReaderStrategy;
  let txtStrategy: TxtReaderStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileReaderFactory, PdfReaderStrategy, DocxReaderStrategy, TxtReaderStrategy],
    }).compile();

    factory = module.get<FileReaderFactory>(FileReaderFactory);
    pdfStrategy = module.get<PdfReaderStrategy>(PdfReaderStrategy);
    docxStrategy = module.get<DocxReaderStrategy>(DocxReaderStrategy);
    txtStrategy = module.get<TxtReaderStrategy>(TxtReaderStrategy);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  it('should return PdfReaderStrategy for key "pdf"', () => {
    const strategy = factory.getStrategy('pdf');
    expect(strategy).toBeInstanceOf(PdfReaderStrategy);
  });

  it('should return DocxReaderStrategy for key "docx"', () => {
    const strategy = factory.getStrategy('docx');
    expect(strategy).toBeInstanceOf(DocxReaderStrategy);
  });

  it('should return TxtReaderStrategy for key "txt"', () => {
    const strategy = factory.getStrategy('txt');
    expect(strategy).toBeInstanceOf(TxtReaderStrategy);
  });

  it('should return undefined', () => {
    expect(factory.getStrategy('xlsx')).toBeUndefined();
  });
});
