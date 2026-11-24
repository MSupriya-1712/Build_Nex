import fs from 'fs';
import path from 'path';
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_EXPENSES,
  INITIAL_MATERIALS,
  INITIAL_CUSTOMERS,
  INITIAL_BOOKINGS,
  INITIAL_PROGRESS_UPDATES,
  INITIAL_NOTIFICATIONS,
} from './sampleData';
import { realtimeBus } from '../services/realtimeBus';

const DB_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'buildnex_live_database.json');

const clone = <T>(val: T): T => JSON.parse(JSON.stringify(val));

export class PersistentStore {
  public projects: any[] = [];
  public tasks: any[] = [];
  public expenses: any[] = [];
  public materials: any[] = [];
  public customers: any[] = [];
  public bookings: any[] = [];
  public progressUpdates: any[] = [];
  public notifications: any[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        this.projects = Array.isArray(data.projects) ? data.projects : clone(INITIAL_PROJECTS);
        this.tasks = Array.isArray(data.tasks) ? data.tasks : clone(INITIAL_TASKS);
        this.expenses = Array.isArray(data.expenses) ? data.expenses : clone(INITIAL_EXPENSES);
        this.materials = Array.isArray(data.materials) ? data.materials : clone(INITIAL_MATERIALS);
        this.customers = Array.isArray(data.customers) ? data.customers : clone(INITIAL_CUSTOMERS);
        this.bookings = Array.isArray(data.bookings) ? data.bookings : clone(INITIAL_BOOKINGS);
        this.progressUpdates = Array.isArray(data.progressUpdates) ? data.progressUpdates : clone(INITIAL_PROGRESS_UPDATES);
        this.notifications = Array.isArray(data.notifications) ? data.notifications : clone(INITIAL_NOTIFICATIONS);
        console.log(`[Database] Loaded persistent live data from ${DB_FILE}`);
      } else {
        this.reset(false);
        this.save();
        console.log(`[Database] Initialized new persistent live database at ${DB_FILE}`);
      }
    } catch (err: any) {
      console.error('[Database] Error loading persistent DB file, using fallback baseline:', err);
      this.reset(false);
    }
  }

  public save() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const data = {
        projects: this.projects,
        tasks: this.tasks,
        expenses: this.expenses,
        materials: this.materials,
        customers: this.customers,
        bookings: this.bookings,
        progressUpdates: this.progressUpdates,
        notifications: this.notifications,
        lastUpdated: new Date().toISOString(),
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to write persistent DB file:', err);
    }
  }

  public reset(broadcast = true) {
    this.projects = clone(INITIAL_PROJECTS);
    this.tasks = clone(INITIAL_TASKS);
    this.expenses = clone(INITIAL_EXPENSES);
    this.materials = clone(INITIAL_MATERIALS);
    this.customers = clone(INITIAL_CUSTOMERS);
    this.bookings = clone(INITIAL_BOOKINGS);
    this.progressUpdates = clone(INITIAL_PROGRESS_UPDATES);
    this.notifications = clone(INITIAL_NOTIFICATIONS);
    this.save();

    if (broadcast) {
      realtimeBus.broadcast({
        type: 'DATABASE_RESET',
        action: 'update',
        message: 'System database restored to production baseline',
      });
    }
  }
}

export const persistentStore = new PersistentStore();
export const memStore = persistentStore;
