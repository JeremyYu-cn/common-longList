<template>
  <div
    id="long_list_box"
    style="height: 200px; width: 300px; background: #f1f1f1; overflow-y: scroll;"
  >
    <div
      :class="'long_list_' + index"
      v-for="(item, index) in onShowList"
      :key="index"
      :ref="'long_list_' + index"
    >
      <div
        :class="'long_list_split_' + index + '_' + splitIndex"
        v-for="(split, splitIndex) in item"
        :key="splitIndex"
      >
        <slot :item="split" />
      </div>
    </div>
  </div>
</template>

<script>
import { observeList } from '../utils/observerList.ts';

export default {
  name: 'LongList',
  props: {
    list: {
      type: Array,
      default: [],
    },
    limit: {
      type: Number,
      default: 10,
    },
    maxTarget: {
      type: Number,
      default: 5,
    }
  },
  data() {
    return {
      // 当前在页面的数据
      onShowList: [],

      // 当前渲染的对象列表
      onShowElement: [],

      // 缓存的页面对象
      cacheShowTarget: [],

      // 缓存页面数据列表
      cacheShowList: [],

      // 当前第几页
      currentIndex: 0,

      // 监听器
      observer: null,
    }
  },

  mounted() {
    // const { maxTarget, onShowTarget, } = this
    this.handleObserver();
  },

  methods: {
    loadData() {
      const { limit, list, currentIndex, } = this;
      const start = currentIndex * limit;
      const end = limit;
      const showArr = list.splice(start, end);
      if (!showArr.length) return;
      this.onShowList.push(showArr);
      this.currentIndex++;
    },
    handleObserver() {
      this.observer = observeList({
        element: '#long_list_box',
        onShowTarget: this.onShowElement,
        loadFun: async () => {
          const { currentIndex, maxTarget, onShowList, observer, } = this;
          if (onShowList.length >= maxTarget) {
            const cancelList = this.onShowList.shift();
            const cancelTarget = this.onShowElement.shift();
            observer.unobserve(cancelTarget);
            this.cacheShowTarget.push(cancelTarget);
            this.cancelList.push(cancelList);
          }

          this.loadData();
          await this.$nextTick();
          if (this.$refs[`long_list_${ currentIndex }`]) {
            const target = this.$refs[`long_list_${ currentIndex }`][0];
            this.onShowElement.push(target);
            this.observer.observe(target);
          }
        },
        reloadFun: () => {
          const { currentIndex, maxTarget, onShowList, observer, } = this;
          if (onShowList.length < maxTarget) return;
          
          this.onShowList.pop();
          const cancelTarget = this.onShowElement.pop();
          observer.unobserve(cancelTarget);

          this.currentIndex--;
        },
      })
    },
  }
}

</script>

<style scoped>

</style>