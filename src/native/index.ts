/**
 * 原生JS实现长列表加载
 * date: 2021-05-18
 * update: 2021-05-18
 * author Jeremy.Yu
 */
import { observeList, } from '../utils/observerList';

type LoadFunction<T> = (item: T) => Element

// 当前在页面的对象
let onShowTarget: Array<Element> = [];
// 缓存的页面对象
let cacheShowTarget: Array<Element> = [];

/**
 * 初始化
 * @param targetElementId 列表父节点ID
 * @returns 
 */
function init(targetElementId: string): {
  el: Element,
  targetEl: Element,
  beforeEl: Element,
} {
  const el = document.querySelector(targetElementId);
  if (!el) throw new Error('element is not exists');
  const after = document.createElement('span');
  after.className = 'after_el';

  const before = document.createElement('span');
  before.className = 'before_el';

  el.appendChild(before);
  el.appendChild(after);
  return { el, targetEl: after, beforeEl: before };
}

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

/**
 * 将数据插入节点
 * @param observe 
 * @param el 
 * @param targetEl 
 * @param listArr 
 * @param index 
 * @param loadFunction 
 */
function insertDataToElement<T extends Record<string, any>>(
  observe: IntersectionObserver,
  el: Element,
  targetEl: Element,
  listArr: Array<T>,
  index: number,
  loadFunction: LoadFunction<T>
) {
  const fragment = document.createDocumentFragment();
  const element = LoadData({ listArr, index, loadFunction, })
  fragment.appendChild(element);
  el.insertBefore(fragment, targetEl);
  pushElementToShowArr(el, element, observe);
  observe.observe(element);
}

function reLoadDataToElement(
  el: Element,
  beforeEl: Element,
): boolean {
  if (onShowTarget.length > 5) return false;
  const fragment = document.createDocumentFragment();
  const element = cacheShowTarget.shift();
  console.log(element);
  
  if (!element) return false;

  fragment.appendChild(element);
  console.log(beforeEl.nextSibling);
  
  el.insertBefore(fragment, beforeEl.nextSibling);
  returnElementToShowArr(el, element);

  return true;
}

function pushElementToShowArr(rootEl: Element, el: Element, observe: IntersectionObserver) {
  if (onShowTarget.length > 5) {
    const element = <Element>onShowTarget.shift();
    observe.unobserve(element)
    cacheShowTarget.push(element);
    rootEl.removeChild(element);
  }
  onShowTarget.push(el);
}

function returnElementToShowArr(rootEl: Element,el: Element) {
  if (onShowTarget.length > 5) {
    const element = <Element>onShowTarget.pop();
    rootEl.removeChild(element);
    onShowTarget.unshift(el);
  }
}

export default function loadLongData<T>(
  targetElementId: string,
  listArr: Array<T>,
  loadFunction: LoadFunction<T>
) {
    let index = 0;
    const { el, targetEl, beforeEl, } = init(targetElementId);
    observeList({
      element: el,
      onShowTarget,
      loadFun: (observe: IntersectionObserver) => {
        insertDataToElement(observe, el, targetEl, listArr, index, loadFunction);
        index++;
      },
      reloadFun: () => {
        const reloadResult = reLoadDataToElement(el, beforeEl)
        if (reloadResult) index--;
      }
    });
}

