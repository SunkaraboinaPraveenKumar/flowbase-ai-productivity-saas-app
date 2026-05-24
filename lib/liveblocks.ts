import { Liveblocks } from '@liveblocks/node';

const getLiveblocks = () => {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) {
    throw new Error('LIVEBLOCKS_SECRET_KEY is not set');
  }
  return new Liveblocks({ secret });
};

export { getLiveblocks };
export default getLiveblocks;
