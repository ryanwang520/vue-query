import Vue from 'vue';

import useQuery from '../src/useQuery';
import VueCompositionApi, { reactive } from '@vue/composition-api';

Vue.config.productionTip = false;

beforeAll(() => {
  Vue.use(VueCompositionApi);
});

function flushPromises() {
  return new Promise(function(resolve) {
    setTimeout(resolve);
  });
}

describe('test single string arg', () => {
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

  test('first arg is a function returns string', async () => {
    const context = reactive({
      path: 'https://github.com',
    });
    let newPath = 'https://gitlab.com';
    const fetcher = () =>
      new Promise(resolve => {
        console.log('fetch');
        if (context.path == newPath) {
          resolve({ status: 404 });
        }
        resolve({ status: 200 });
      });
    const result = useQuery(() => context.path, fetcher);
    expect(result.data.value).toBe(null);
    expect(result.error.value).toBe(null);
    expect(result.isInitial.value).toBe(true);
    expect(result.loading.value).toBe(true);

    await flushPromises();
    expect(result.data.value).toEqual({ status: 200 });
    expect(result.error.value).toBe(null);
    expect(result.isInitial.value).toBe(false);
    expect(result.loading.value).toBe(false);

    context.path = newPath;
    expect(result.data.value).toEqual({ status: 200 });
    expect(result.error.value).toBe(null);
    expect(result.isInitial.value).toBe(false);
    await flushPromises();
    expect(result.data.value).toEqual({ status: 404 });
  });
});
