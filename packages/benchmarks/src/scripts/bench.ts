import { z } from 'zod';

const name = z
  .enum(['simpleQueryAll', 'nestedSelect', 'simpleInsert', 'nestedInsert'])
  .parse(process.argv[2]);

const orm = process.argv.find((item) => item.startsWith('--orm='))?.slice(6);

// eslint-disable-next-line @typescript-eslint/no-var-requires
(require(`../benchmarks/${name}`) as { run(orm?: string): void }).run(orm);
