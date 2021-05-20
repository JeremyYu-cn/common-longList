/**
 * 原生JS实现长列表加载
 * date: 2021-05-18
 * update: 2021-05-20
 * author Jeremy.Yu
 */


/**
 * 监听指定的element
 * @param element 需要监听的根结点
 * @param observeElement elementId
 * @param loadFun 满足特定条件时触发的操作
 */
interface IObserverOption {
  element: string | Element,
  onShowTarget: Array<Element>
  loadFun: (...data: any[]) => void,
  reloadFun: (...data: any[]) => void,
}
export function observeList(data: IObserverOption): IntersectionObserver {
  let { loadFun, reloadFun, element, onShowTarget, } = data;
  if (typeof element === 'string') {
    const el = document.querySelector(element);
    if (!el) throw new Error('element is not defined');
    element = el;
  }
  
  const observe = new IntersectionObserver((entries) => {
    
    console.log(onShowTarget);
    console.log(entries[0].target);
    const isRootEl = entries[0].target === element;
    const isCurrentEl = isRootEl || entries[0].target === onShowTarget[ onShowTarget.length - 1 ];
    const isPrevEl = entries[0].target === onShowTarget[ onShowTarget.length - 2 ];

    if (entries[0].isIntersecting && isCurrentEl) {
      loadFun(observe);
    } else if (!entries[0].isIntersecting && isPrevEl){
      reloadFun(observe);
    }
  })
  observe.observe(element);

  return observe;
}

