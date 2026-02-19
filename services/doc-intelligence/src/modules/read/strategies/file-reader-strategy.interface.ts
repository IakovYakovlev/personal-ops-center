export interface FileReaderStrategy {
  key: string;
  read(buffer: Buffer): Promise<string>;
}
