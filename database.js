import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const openDb = async () => {
    return open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });
};

export { openDb };
