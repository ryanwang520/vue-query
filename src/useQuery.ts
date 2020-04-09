import { computed, reactive, watch, toRefs, Ref } from '@vue/composition-api';

type Refs<Data> = {
  [K in keyof Data]: Data[K] extends Ref<infer V> ? Ref<V> : Ref<Data[K]>;
};

type Response = Refs<{
  data: any;
  loading: boolean;
  error: Error | null;
  isInitial: boolean;
}> & { refetch: () => void };

// path
export default function useQuery<K>(
  computedPath: () => string,
  fetcher: (arg: string) => Promise<K>
): Response;

// multi args
export default function useQuery<T extends readonly any[], K>(
  args: T,
  fetcher: (...args: T) => Promise<K>
): Response;

// computed path
export default function useQuery<K>(
  path: string,
  fetcher: (arg: string) => Promise<K>
): Response;

// computed mulitple args
export default function useQuery<T extends any[], M extends T, K>(
  computed: () => T,
  fetcher: (...args: M) => Promise<K>
): Response;

export default function useQuery<T extends readonly any[], K>(
  computedFnOrArgs: string | (() => string) | T | (() => T),
  fetcher: (...args: any) => Promise<K>
): Response {
  let argRef:
    | Readonly<Ref<Readonly<T>>>
    | Readonly<Ref<Readonly<string>>>
    | null = null;
  if (typeof computedFnOrArgs == 'function') {
    /// @ts-ignore
    argRef = computed(computedFnOrArgs);
  }

  const state = reactive({
    data: null,
    loading: true,
    error: null,
    isInitial: true,
  });

  const fetchData = () => {
    state.loading = true;
    let args: readonly any[];
    if (argRef) {
      if (Array.isArray(argRef.value)) {
        args = argRef.value;
      } else {
        args = [argRef.value];
      }
    } else {
      if (Array.isArray(computedFnOrArgs)) {
        args = computedFnOrArgs;
      } else {
        args = [computedFnOrArgs];
      }
    }
    fetcher(...args)
      .then((res: any) => {
        state.data = res;
      })
      .catch((error: any) => {
        state.error = error;
      })
      .finally(() => {
        state.loading = false;
        state.isInitial = false;
      });
  };

  if (argRef) {
    // @ts-ignore
    watch(argRef, fetchData);
  } else {
    fetchData();
  }

  return { ...toRefs(state), refetch: fetchData };
}
