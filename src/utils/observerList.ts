
/**
 * 监听指定的element
 * @param observeElement elementId
 * @param loadFun 满足特定条件时触发的操作
 */
export function observeList(element: Element, loadFun: (...data: any[]) => void) {

  const observe = new IntersectionObserver((entries, observer) => {
    
    if (entries[0].isIntersecting) {
      observe.unobserve(entries[0].target)
      loadFun(observe);
    }
  })
  observe.observe(element);
}
