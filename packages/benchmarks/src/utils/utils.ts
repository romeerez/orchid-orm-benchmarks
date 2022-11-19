export type BenchCase = {
  start?(): Promise<void>;
  run(): Promise<void>;
  stop?(): Promise<void>;
};

const measure = async (
  title: string,
  fn: () => Promise<void>,
  times: number
) => {
  const start = process.hrtime();

  for (let i = 0; i < times; i++) {
    await fn();
  }

  const elapsed = process.hrtime(start);
  console.log(
    `${title}: ${elapsed[0] ? `${elapsed[0]}s ` : ''}${(
      elapsed[1] / 1000000
    ).toFixed(1)}ms`
  );
};

export const runBenchmark = async (
  {
    orm,
    runTimes,
    beforeEach,
  }: {
    orm: string | undefined;
    runTimes: number;
    beforeEach?(): Promise<void>;
  },
  benchCases: Record<string, BenchCase>
) => {
  const cases = orm ? { [orm]: benchCases[orm] } : benchCases;

  for (const name in cases) {
    await beforeEach?.();
    const bench = cases[name];
    await bench.start?.();
    await measure(name, bench.run, runTimes);
    await bench.stop?.();
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
