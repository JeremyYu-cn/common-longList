/**
 * 原生JS实现长列表加载
 * date: 2021-05-18
 * update: 2021-05-20
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

/**
 * 将上一页数据还原到HTML中
 * @param el 列表父节点
 * @param beforeEl // 列表头结点
 * @param observer // 监听器
 * @returns 
 */
function reLoadDataToElement(
  el: Element,
  beforeEl: Element,
  observer: IntersectionObserver,
): boolean {
  if (onShowTarget.length < 5) return false;
  const fragment = document.createDocumentFragment();
  const element = cacheShowTarget.pop();
  
  if (!element) return false;

  fragment.appendChild(element);
  
  el.insertBefore(fragment, beforeEl.nextSibling);
  returnElementToShowArr(el, element);
  observer.observe(element);
  return true;
}

/**
 * 将展示的数据添加到当前展示列表中
 * @param rootEl 根结点
 * @param el 插入的数据结点
 * @param observe 监听器
 */
function pushElementToShowArr(rootEl: Element, el: Element, observe: IntersectionObserver): void {
  // 若当前展示的数据组大于5个时将删掉数组中第一个Element
  if (onShowTarget.length >= 5) {
    const element = <Element>onShowTarget.shift();
    observe.unobserve(element);
    cacheShowTarget.push(element);
    rootEl.removeChild(element);
  }
  onShowTarget.push(el);
}

/**
 * 将隐藏的数据从缓存数组中还原到展示页
 * @param rootEl 根结点
 * @param el 还原的数据结点
 */
function returnElementToShowArr(rootEl: Element,el: Element): void {
  // 只有展示列表有5个时，才执行操作
  if (onShowTarget.length >= 5) {
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
      reloadFun: (observe: IntersectionObserver) => {
        const reloadResult = reLoadDataToElement(el, beforeEl, observe);
        if (reloadResult) index--;
      }
    });
}

