import { Native, } from '../../src/index';

Native<{ value: string }>({
  targetElementId: '#app',
  listArr: [],
  limit: 20,
  pageNum: 6,
  loadFunction: (item) => {
    const li = document.createElement('li');
    li.innerHTML = item.value;
    return li;
  },
  getNext: () => {
    return new Promise(resolve => {
      setTimeout(() => {
        let tmpArr = [];
        for(let i = 0; i < 20; i++) {
          tmpArr.push({ value: `list_${ i }`, });
        }
        resolve(tmpArr);
      }, 500)
    })
  },
});