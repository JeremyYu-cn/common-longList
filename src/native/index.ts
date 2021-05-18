/**
 * 原生JS实现长列表加载
 * date: 2021-05-18
 * update: 2021-05-18
 * author Jeremy.Yu
 */
import { observeList, } from '../utils/observerList';

function init(targetElementId: string): { el: Element, targetEl: Element, } {
  const el = document.querySelector(targetElementId);
  if (!el) throw new Error('element is not exists');
  const span = document.createElement('span');
  span.className = 'base_el';

  el.appendChild(span);
  return { el, targetEl: span };
}

type LoadFunction<T> = (item: T) => Element

/**
 * 加载数据
 * @param data 
 * @returns 
 */
function LoadData<T extends Record<string, any>>(data: {
  listArr: Array<T>,
  index: number,
  loadFunction: LoadFunction<T>
}): Element {
  const { index, listArr, loadFunction, } = data;
  const start = index * 20;
  const end = (index + 1) * 20;
  const ul = document.createElement('ul');
  const ulId = `long_list_ul_${ index }`;
  ul.id = ulId;
  const showArr = listArr.slice(start, end);
  showArr.forEach(item => {
    ul.appendChild(loadFunction(item));
  })
  return ul;
}

export default function loadLongData<T>(
  targetElementId: string,
  listArr: Array<T>,
  loadFunction: LoadFunction<T>
) {
    let index = 0;
    const { el, targetEl, } = init(targetElementId);

    observeList(el, (observe: IntersectionObserver) => {
      const fragment = document.createDocumentFragment();
      const element = LoadData({ listArr, index, loadFunction, })
      fragment.appendChild(element);
      el.insertBefore(fragment, targetEl);
      index++;
      observe.observe(element);
    });
}

