<template>
  <div
    id="long_list_box"
    class="long_list_box"
  >
    <div
      :class="'long_list_' + item.id"
      v-for="item in onShowList"
      :key="item.id"
      :ref="'long_list_' + item.id"
    >
      <div
        :class="'long_list_split_' + item.id + '_' + splitIndex"
        v-for="(split, splitIndex) in item.children"
        :key="splitIndex"
      >
        <slot :item="split" />
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 基于VUE实现长列表加载
 * date: 2021-05-20
 * update: 2021-05-20
 * author Jeremy.Yu
 */
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
    },
    getNext: {
      type: Function,
      default: () => {},
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
    this.handleObserver();
  },

  methods: {
    loadData() {
      const { limit, list, currentIndex, } = this;
      const start = currentIndex * limit;
      const end = (currentIndex + 1) * limit;
      const showArr = list.slice(start, end);
      if (!showArr.length) return;
      this.onShowList.push({ id: currentIndex, children: showArr });
      this.currentIndex++;
    },
    handleObserver() {
      this.observer = observeList({
        element: '#long_list_box',
        onShowTarget: this.onShowElement,
        loadFun: async () => {
          const { maxTarget, onShowList, observer, } = this;

          this.loadData();

          await this.$nextTick();

          if (onShowList.length > maxTarget) {
            const cancelList = this.onShowList.shift();
            const cancelTarget = this.onShowElement.shift();
            observer.unobserve(cancelTarget);
            this.cacheShowTarget.push(cancelTarget);
            this.cacheShowList.push(cancelList);
          }

          await this.$nextTick();
          if (this.$refs[`long_list_${ this.currentIndex - 1 }`]) {
            const target = this.$refs[`long_list_${ this.currentIndex - 1 }`][0];
            this.onShowElement.push(target);
            this.observer.observe(target);
          }
        },
        reloadFun: async () => {
          const { maxTarget, onShowList, observer, cacheShowTarget, cacheShowList, } = this;
          if (onShowList.length < maxTarget) return;

          if (!cacheShowTarget.length && !cacheShowList.length) return;

          this.onShowList.pop();
          const cacheList = cacheShowList.pop(); 
          this.onShowList.unshift(cacheList);
          const showElement = cacheShowTarget.pop();

          await this.$nextTick();

          const cancelTarget = this.onShowElement.pop();
          observer.unobserve(cancelTarget);

          if (this.$refs[`long_list_${ cacheList.id }`]) {
            const target = this.$refs[`long_list_${ cacheList.id }`][0];
            this.onShowElement.unshift(target);
            observer.observe(target);
          }

          this.currentIndex--;
        },
      })
    },
  }
}

</script>

<style scoped>
.long_list_box {
  overflow-y: scroll;
  width: 300px;
  height: 200px;
  background: #f1f1f1;
}
</style>
