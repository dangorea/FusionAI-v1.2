import EventEmitter from 'eventemitter3';
import { IndexedDBService } from '../indexedDB-api';

export interface CodeGenerationHistoryEntity {
  sessionId: string;
  promptLabel: string;

  [key: string]: unknown;
}

export class CodeGenerationHistoryService extends IndexedDBService<CodeGenerationHistoryEntity> {
  private eventEmitter: EventEmitter;

  constructor() {
    super({
      dbName: 'angenai',
      storeName: 'code-generation-history',
      dbVersion: 1,
      keyPath: 'sessionId',
      autoIncrement: false,
    });
    this.eventEmitter = new EventEmitter();
  }

  async saveSession(session: CodeGenerationHistoryEntity): Promise<void> {
    await this.save(session);
    await this.notifySubscribers();
  }

  async getAllSessions(): Promise<CodeGenerationHistoryEntity[]> {
    const allSessions = await this.getAll();
    return allSessions;
  }

  async deleteSessionByKey(key: string): Promise<void> {
    await this.deleteByKey(key);
    await this.notifySubscribers();
  }

  async clearHistory(): Promise<void> {
    await this.clearStore();
    await this.notifySubscribers();
  }

  subscribe(callback: (data: CodeGenerationHistoryEntity[]) => void): void {
    this.eventEmitter.on('update', callback);
  }

  unsubscribe(callback: (data: CodeGenerationHistoryEntity[]) => void): void {
    this.eventEmitter.off('update', callback);
  }

  private async notifySubscribers(): Promise<void> {
    const allSessions = await this.getAllSessions();
    this.eventEmitter.emit('update', allSessions);
  }
}

const codeGenerationHistoryService = new CodeGenerationHistoryService();
export default codeGenerationHistoryService;
