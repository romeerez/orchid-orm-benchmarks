import { verifyToken } from '../../lib/jwt';
import { UnauthorizedError } from '../../lib/errors';

export const getCurrentUserId = (req: {
  headers: { authorization?: string };
}): number => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length);
    try {
      const payload = verifyToken(token);
      if (typeof payload === 'object' && typeof payload.id === 'number') {
        return payload.id;
      }
    } catch (_) {}
  }

  throw new UnauthorizedError();
};
