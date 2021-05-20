import { Native, } from '../../src/index';

let arr: Record<string, any>[] = [];
for(let i = 0; i < 100000; i++) {
  arr.push({ value: `list_${ i }`, });
}

Native('#div', arr, (item) => {
  const li = document.createElement('li');
  li.innerHTML = item.value;
  return li;
});