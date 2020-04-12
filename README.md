# vue-query [![npm package](https://badgen.net/npm/v/@baoshishu/vue-query)](https://www.npmjs.com/package/@baoshishu/vue-query) [![Actions Status](https://github.com/baoshishu/vue-query/workflows/CI/badge.svg)](https://github.com/baoshishu/vue-query/actions)

> Composition API for fetching asynchronous data in Vue.

**Depends on [@vue/composition-api](https://github.com/vuejs/composition-api)**

## Installation

```sh
npm install @baoshishu/vue-query
```

## Usage

```vue
<template>
  <div>
    <div v-if="error">error!</div>
    <div v-else-if="loading">...loading</div>
    <pre v-else>{{ JSON.stringify(data) }}</pre>
  </div>
</template>

<script>
import { createComponent } from '@vue/composition-api';
import { useQuery } from '@baoshishu/vue-query';

export default createComponent({
  setup() {
    const fetcher = name =>
      fetch(`https://api.github.com/users/{name}`).then(res => res.json());
    return useQuery(name, fetcher);
  },
});
</script>
```

If first argument of `useQuery` is a function, the result of this function will be passed to `fetcher` function, and it will be reactive.

```vue
<template>
  <div>
    <div v-if="error">error!</div>
    <div v-else-if="loading">...loading</div>
    <pre v-else>{{ JSON.stringify(data) }}</pre>
  </div>
</template>
<script>
export default {
  setup(props, context) {
    const fetcher = ({ path, params }) => {
      return fetch(
        `https://api.github.com/users?per_page=${params.per_page}&page=${params.page}`
      ).then(res => res.json());
    };
    return useQuery(
      () => ({
        path: '/users',
        params: { ...context.root.$route.query },
      }),
      fetcher
    );
  },
};
</script>
```

When _route_ changes page or per*page, as \_route* is reactive, new request would be fired to fetch users of new `page` or `per_page`

## Related

- [@vue/composition-api](https://github.com/vuejs/composition-api)

## License

[MIT](http://opensource.org/licenses/MIT)
