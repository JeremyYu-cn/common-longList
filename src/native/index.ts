/**
 * 原生JS实现长列表加载
 * date: 2021-05-18
 * update: 2021-05-20
 * author Jeremy.Yu
 */
import { observeList, } from '../utils/observerList';

type LoadFunction<T> = (item: T) => Element

type GetNextFunction<T> = () => Promise<Array<T>>

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
  limit: number
}): Element | null {
  const { index, listArr, loadFunction, limit, } = data;
  const start = index * limit;
  const end = (index + 1) * limit;
  const ul = document.createElement('ul');
  const ulId = `long_list_ul_${ index }`;
  ul.id = ulId;
  const showArr = listArr.slice(start, end);
  if (!showArr.length) return null;
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
  loadFunction: LoadFunction<T>,
  limit: number = 10,
  pageNum: number = 5,
): boolean {
  const fragment = document.createDocumentFragment();
  const element = LoadData({ listArr, index, loadFunction, limit, });
  if (!element) return false;
  fragment.appendChild(element);
  el.insertBefore(fragment, targetEl);
  pushElementToShowArr(el, element, pageNum, observe);
  observe.observe(element);
  return true;
}

/**
 * 将上一页数据还原到HTML中
 * @param el 列表父节点
 * @param beforeEl // 列表头结点
 * @param pageNum // 最多同时显示多少页数据
 * @param observer // 监听器
 * @returns 
 */
function reLoadDataToElement(
  el: Element,
  beforeEl: Element,
  pageNum: number = 5,
  observer: IntersectionObserver,
): boolean {
  if (onShowTarget.length < 5) return false;
  const fragment = document.createDocumentFragment();
  const element = cacheShowTarget.pop();
  
  if (!element) return false;

  fragment.appendChild(element);
  
  el.insertBefore(fragment, beforeEl.nextSibling);
  returnElementToShowArr(el, element, pageNum);
  observer.observe(element);
  return true;
}

/**
 * 将展示的数据添加到当前展示列表中
 * @param rootEl 根结点
 * @param el 插入的数据结点
 * @param observe 监听器
 */
function pushElementToShowArr(rootEl: Element, el: Element, pageNum: number,observe: IntersectionObserver,): void {
  // 若当前展示的数据组大于5个时将删掉数组中第一个Element
  if (onShowTarget.length >= pageNum) {
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
 * @param pageNum 最多显示多少页数据
 */
function returnElementToShowArr(rootEl: Element,el: Element, pageNum: number): void {
  // 只有展示列表有5个时，才执行操作
  if (onShowTarget.length >= pageNum) {
    const element = <Element>onShowTarget.pop();
    rootEl.removeChild(element);
    onShowTarget.unshift(el);
  }
}

interface ILoadLongDataOption<T> {
  /**
   * 注入数据的元素ID
   */
  targetElementId: string,
  /**
   * 列表数据
   */
  listArr: Array<T>,
  /**
   * 列表HTMl
   */
  loadFunction: LoadFunction<T>,
  /**
   * 获取下一页方法
   */
  getNext?: GetNextFunction<T>,
  /**
   * 每页条数
   */
  limit?: number,
  /**
   * 最多同时显示多少页数据
   */
  pageNum?: number
}
export default function loadLongData<T>(data: ILoadLongDataOption<T>) {
    const { targetElementId, listArr, loadFunction, getNext, limit, pageNum = 5 } = data;
    let index = 0;
    const { el, targetEl, beforeEl, } = init(targetElementId);
    let arr = listArr;
    observeList({
      element: el,
      onShowTarget,
      maxContainerNum: pageNum,
      loadFun: async (observe: IntersectionObserver) => {
        if (getNext && typeof getNext === 'function') {
          const nextList = await getNext();
          if (!nextList.length) return;
          arr = arr.concat(nextList);
        }
        const result = await insertDataToElement(observe, el, targetEl, arr, index, loadFunction, limit, pageNum);
        if (result) index++;
        
      },
      reloadFun: (observe: IntersectionObserver) => {
        const reloadResult = reLoadDataToElement(el, beforeEl, pageNum, observe);
        if (reloadResult) index--;
      }
    });
}

