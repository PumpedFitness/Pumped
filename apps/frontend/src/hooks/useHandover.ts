const handoverUrl = 'https://handover.devinfritz.workers.dev/';
import base64 from 'react-native-base64';
type HandoverResult =
  | {
      status: 'success';
      data: {
        uuid: string;
        ttl: number;
      };
    }
  | { status: 'error'; error: string; code: number };

type HandoverReceiveResult<T> =
  | {
      status: 'success';
      data: {
        value: T;
      };
    }
  | { status: 'error'; error: string; code: number };

export const useHandover = () => {
  const create = async (json: object): Promise<HandoverResult> => {
    const body = {
      value: base64.encode(JSON.stringify(json)),
    };

    try {
      const result = await fetch(handoverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!result.ok) {
        return {
          status: 'error',
          error: await result.json(),
          code: result.status,
        };
      }

      const data = await result.json();
      return { status: 'success', data: data };
    } catch (error) {
      console.error(error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        code: -1,
      };
    }
  };

  const receive = async <T>(
    uuid: string,
  ): Promise<HandoverReceiveResult<T>> => {
    try {
      const result = await fetch(`${handoverUrl}${uuid}`);

      if (!result.ok) {
        return {
          status: 'error',
          error: result.statusText,
          code: result.status,
        };
      }

      const data = await result.text();
      const decoded = base64.decode(data);

      return { status: 'success', data: { value: JSON.parse(decoded) as T } };
    } catch (error) {
      console.error(error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        code: -1,
      };
    }
  };

  return { create, receive };
};
