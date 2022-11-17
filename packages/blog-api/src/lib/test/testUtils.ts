export const itShouldRequireAuth = (
  req: () => Promise<{ statusCode: number; json(): unknown }>
) => {
  it('should require authorization', async () => {
    const res = await req();
    expectUnauthorized(res);
  });
};

export const expectUnauthorized = (res: {
  statusCode: number;
  json(): unknown;
}) => {
  expect(res.statusCode).toBe(401);
  expect(res.json()).toEqual({
    message: 'Unauthorized',
  });
};
