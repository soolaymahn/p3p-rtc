export type CancelFc = () => void;

// TODO: generics
export const cancellablePromise = (promise: Promise<string>) => {
  const isCancelled = { value: false };
  const wrappedPromise = new Promise<string>((res, rej) => {
    promise
      .then((d) => {
        return isCancelled.value ? rej(isCancelled) : res(d);
      })
      .catch((e) => {
        rej(isCancelled.value ? isCancelled : e);
      });
  });

  return {
    promise: wrappedPromise,
    cancel: () => {
      isCancelled.value = true;
    },
  };
};
