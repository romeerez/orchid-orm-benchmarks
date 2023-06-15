import { poolSize } from '../config';
import { Client } from 'pg';

export const makeDB = (url: string) => {
  return new Client({
    connectionString: url,
  });
};

export type BenchCase = {
  prepare?(): Promise<void>;
  start?(): Promise<void>;
  run(iteration: number): Promise<void>;
  stop?(): Promise<void>;
};

const chunkMs = 1000;
const chunkNano = chunkMs * 1000000;

export const runBenchmark = async (
  {
    orm,
    samples = 10,
    parallel = poolSize,
  }: {
    orm: string | undefined;
    samples?: number;
    parallel?: number;
  },
  benchCases: Record<string, BenchCase>
) => {
  const cases = orm ? { [orm]: benchCases[orm] } : benchCases;

  const results: Record<string, number[]> = {};
  for (const name in cases) {
    results[name] = [];
  }

  const last = samples - 1;
  for (let s = 0; s <= last; s++) {
    for (const name in cases) {
      const bench = cases[name];

      await bench.prepare?.();

      if (s === 0) {
        await bench.start?.();
      }

      const { run } = bench;
      let iteration = 0;

      // warmup connections
      await new Promise<void>((resolve, reject) => {
        let left = parallel;
        const then = () => {
          left--;
          if (left === 0) resolve();
        };

        for (let i = 0; i < parallel; i++) {
          run(iteration++).then(then, reject);
        }
      });

      const start = process.hrtime.bigint();
      let ops = 0;

      await new Promise<void>((resolve, reject) => {
        let queued = parallel;

        const next = () => {
          const elapsed = process.hrtime.bigint() - start;
          if (elapsed >= chunkNano) {
            if (--queued === 0) resolve();
          } else {
            run(iteration++).then(next, reject);
            ops++;
          }
        };

        for (let i = 0; i < parallel; i++) {
          run(iteration++).then(next, reject);
        }
      });

      results[name][s] = ops;

      if (s === last) {
        await bench.stop?.();
      }
    }
  }

  for (const name in results) {
    const sample = results[name];
    const n = sample.length;
    const mean = Math.round(sample.reduce((sum, r) => sum + r, 0) / n);

    console.log(`${name}: ${(mean * 1000) / chunkMs} ops/s`);
  }
};

export const getUserInsertData = (i: number) => ({
  email: `email-${i + 1}@mail.com`,
  firstName: 'first name',
  lastName: 'last name',
  bio: 'user biography sentence is written in the bio column of the user table',
  age: 30,
  city: 'SomeCity',
  country: 'NiceCountry',
});
