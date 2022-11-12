export const itShouldRequireAuth = (
  req: () => Promise<{ statusCode: number; json(): unknown }>
) => {
  it('should require authorization', async () => {
    const res = await req();
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({
      message: 'Unauthorized',
    });
  });
};
