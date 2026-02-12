import { OctetParser, ParsedData } from '../OctetParser';

export interface ArmorData extends ParsedData {
  refineLevel: number;
  durability: number;
  maxDurability: number;
  sockets: number[];
  addons: Buffer; // Keeping as raw buffer for now
  flags: number;
}

export class ArmorParser implements OctetParser {
  // Example size, might vary based on version
  private readonly SIZE = 64;

  parse(buffer: Buffer): ArmorData {
    if (buffer.length < this.SIZE) {
      throw new Error(`Invalid armor octet size. Expected at least ${this.SIZE}, got ${buffer.length}`);
    }

    return {
      refineLevel: buffer.readUInt8(0),
      durability: buffer.readUInt16LE(1),
      maxDurability: buffer.readUInt16LE(3),
      sockets: [
        buffer.readUInt32LE(5),
        buffer.readUInt32LE(9),
        buffer.readUInt32LE(13),
        buffer.readUInt32LE(17)
      ],
      // Assuming addons take 40 bytes (21 to 61)
      addons: buffer.slice(21, 61), 
      flags: buffer.readUInt32LE(61)
    };
  }

  serialize(data: ArmorData): Buffer {
    const buffer = Buffer.alloc(this.SIZE);
    buffer.writeUInt8(data.refineLevel, 0);
    buffer.writeUInt16LE(data.durability, 1);
    buffer.writeUInt16LE(data.maxDurability, 3);

    data.sockets.forEach((socket, i) => {
      buffer.writeUInt32LE(socket, 5 + (i * 4));
    });

    if (data.addons && data.addons.length > 0) {
      data.addons.copy(buffer, 21);
    }

    buffer.writeUInt32LE(data.flags, 61);

    return buffer;
  }

  validate(buffer: Buffer): boolean {
    // Basic validation
    return buffer.length >= this.SIZE;
  }

  getSize(): number {
    return this.SIZE;
  }
}
