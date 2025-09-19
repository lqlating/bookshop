// 日期格式化
export const formatDate = (date: Date | string) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 防抖函数
export const debounce = (fn: Function, delay: number) => {
  let timer: NodeJS.Timeout
  return function(...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 本地存储封装
export const storage = {
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get(key: string) {
    const value = localStorage.getItem(key)
    if (value) {
      try {
        return JSON.parse(value)
      } catch (e) {
        return value
      }
    }
    return null
  },
  remove(key: string) {
    localStorage.removeItem(key)
  }
}
