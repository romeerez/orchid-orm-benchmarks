import { verifyToken } from '../../lib/jwt';
import { UnauthorizedError } from '../../lib/errors';

export const getCurrentUserId = (req: {
  headers: { authorization?: string };
}): number => {
  const id = getOptionalCurrentUserId(req);
  if (id) return id;
  else throw new UnauthorizedError();
};

export const getOptionalCurrentUserId = (req: {
  headers: { authorization?: string };
}): number | undefined => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length);
    try {
      const payload = verifyToken(token);
      if (typeof payload === 'object' && typeof payload.id === 'number') {
        return payload.id;
      }
    } catch (_) {
      throw new UnauthorizedError();
    }
  }
  return undefined;
};
