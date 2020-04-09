import Vue from 'vue';

import useQuery from '../src/useQuery';
import VueCompositionApi from '@vue/composition-api';

beforeAll(() => {
  Vue.use(VueCompositionApi);
});

function flushPromises() {
  return new Promise(function(resolve) {
    setTimeout(resolve);
  });
}

describe('test useQuery', () => {
  test('first arg is string', async () => {
    const path = 'https://github.com';
    const response = { status: 200 };
    const fetcher = () => Promise.resolve(response);
    const result = useQuery(path, fetcher);
    expect(result.data.value).toBe(null);
    expect(result.error.value).toBe(null);
    expect(result.isInitial.value).toBe(true);
    expect(result.loading.value).toBe(true);

    await flushPromises();
    expect(result.data.value).toBe(response);
    expect(result.error.value).toBe(null);
    expect(result.isInitial.value).toBe(false);
    expect(result.loading.value).toBe(false);
  });
});
