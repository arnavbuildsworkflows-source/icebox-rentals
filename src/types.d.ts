import 'react'

declare module 'react' {
  // React 18 only forwards the lowercase attribute to the DOM; its types only know the camelCase one.
  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto'
  }
}
