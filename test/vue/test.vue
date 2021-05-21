<template>
  <div>
    <LongList :list="list">
      <template v-slot:default="scope">
        <p>list_column_{{ scope.item.value }}</p>
      </template>
    </LongList>
  </div>
</template>

<script>
import LongList from '../../src/vue/index.vue';
export default {
  name: 'Main',
  components: {
    LongList,
  },
  data: () => {
    return {
      list: [],
    }
  },
  created() {
    let arr = [];
    for(let i = 0; i < 100; i++) {
      arr.push({ value: `list_${ i }`, });
    }
    this.list = arr;
  },

}
</script>
