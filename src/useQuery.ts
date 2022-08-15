import { computed, reactive, watch, toRefs, Ref } from 'vue';

type Refs<Data> = {
  [K in keyof Data]: Ref<Data[K]>;
};

type UseQueryReturn<K> = Refs<{
  loading: boolean;
  data: K | null;
  error: any;
  isInitial: boolean;
}> & { refetch: () => void };

const defaultConfig: Config = {};

type Config<K = unknown> = {
  enabled?: (() => any) | Ref;
  success?(data: K): void;
};

// computed mulitple args
export default function useQuery<K = any, T extends any[] = any[]>(
  computed: () => T,
  fetcher: (...args: T) => Promise<K>,
  config?: Config<K>
): UseQueryReturn<K>;

// computed single arg
export default function useQuery<K = any, T = any>(
  computed: () => T,
  fetcher: (arg: T) => Promise<K>,
  config?: Config<K>
): UseQueryReturn<K>;

// multi args
export default function useQuery<K = any, T extends any[] = any[]>(
  args: T,
  fetcher: (...args: T) => Promise<K>,
  config?: Config<K>
): UseQueryReturn<K>;

// single arg
export default function useQuery<K, T>(
  arg: T,
  fetcher: (arg: T) => Promise<K>,
  config?: Config<K>
): UseQueryReturn<K>;

export default function useQuery<T extends readonly any[], K>(
  computedFnOrArgs: T | (() => T),
  fetcher: (...args: any) => Promise<K>,
  config: Config<K> = defaultConfig
) {
  let argRef: Ref<T> | null = null;
  if (typeof computedFnOrArgs == 'function') {
    argRef = computed(computedFnOrArgs);
  }

  const stateObj = {
    data: null,
    loading: false,
    error: null,
    isInitial: true,
  };

  const state = reactive<{
    data: null | T;
    loading: boolean;
    error: any;
    isInitial: boolean;
  }>(stateObj);

  let condition: Ref | null = null;

  const fetchData = () => {
    // avoid duplicate fetch
    if (state.loading) {
      return;
    }
    if (condition && !condition.value) {
      return;
    }

    state.error = null;
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
        config.success?.(res);
      })
      .catch((error: any) => {
        state.error = error;
      })
      .finally(() => {
        state.loading = false;
        state.isInitial = false;
      });
  };
  // conditionally fetch
  if (config.enabled != null) {
    condition = deriveRef(config.enabled);

    watch(condition, val => {
      if (val) {
        fetchData();
      }
    });
  }

  if (argRef) {
    watch(argRef, fetchData, { immediate: true });
  } else {
    fetchData();
  }

  return { ...toRefs(state), refetch: fetchData };
}

function deriveRef(arg: (() => any) | Ref): Ref {
  let result: Ref;
  if (typeof arg == 'function') {
    result = computed(arg);
  } else {
    result = arg;
  }
  return result;
}
