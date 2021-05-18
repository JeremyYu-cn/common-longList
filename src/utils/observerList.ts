
/**
 * 监听指定的element
 * @param element 需要监听的根结点
 * @param observeElement elementId
 * @param loadFun 满足特定条件时触发的操作
 */

interface IobserverOption {
  element: Element,
  onShowTarget: Array<Element>
  loadFun: (...data: any[]) => void,
  reloadFun: (...data: any[]) => void,
}
let index = 0;
export function observeList(data: IobserverOption) {
  const { loadFun, reloadFun, element, onShowTarget, } = data;
  const observe = new IntersectionObserver((entries, observer) => {
    console.log(entries[0].target === onShowTarget[ index % 4 ]);
    
    if (entries[0].isIntersecting) {
      loadFun(observe);
      index++;
    } else if (entries[0].target === onShowTarget[ index % 4 ]){
      reloadFun(observe);
      index--;
    }
  })
  observe.observe(element);
}
