import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";
const open = promisify(fs.open);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export abstract class FileStore<T> {
  constructor(private dbPath: string) {}

  get filePath() {
    return path.resolve(this.dbPath);
  }

  async save(data: T) {
    const serialized = await this.serialize(data);
    await writeFile(this.filePath, serialized, "utf8");
  }

  async ensureStoreExist() {
    await open(this.filePath, fs.constants.O_CREAT);
  }

  async get() {
    await this.ensureStoreExist();
    const fCont = await readFile(this.filePath, "utf8");
    return this.parse(fCont);
  }

  abstract async parse(data: string): Promise<T>;
  abstract async serialize(data: T): Promise<string>;
}
