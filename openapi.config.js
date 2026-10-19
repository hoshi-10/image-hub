import {generateService} from '@umijs/openapi'

generateService({
  // 请求工具
  requestLibPath:"import request from '@/request'",

  //数据源头
  schemaPath: 'http://localhost:8123/api/v2/api-docs',

  //代码生成位置
  serversPath: './src',
})
