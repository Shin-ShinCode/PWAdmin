export interface ParsedData {
  [key: string]: any;
}

export interface OctetParser {
  parse(buffer: Buffer): ParsedData;
  serialize(data: ParsedData): Buffer;
  validate(buffer: Buffer): boolean;
  getSize(): number;
}
