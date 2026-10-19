import axios from 'axios'

declare module 'axios' {
  interface AxiosRequestConfig<D = any> {
    requestType?: 'form' | 'json' | 'upload' | string
  }
}
