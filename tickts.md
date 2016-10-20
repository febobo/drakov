FORMAT: 1A
HOST: http://api.sense.letv.cn/backend-sense-ticket/v1

# 券码管理 Web API 文档

[Mock Server 测试](/mock/backend-sense-ticket/v1/test)

## 0 全局说明

+ 0.1 数据格式
    + 如无特殊说明, 本文档中 API 请求数据(如包含)格式和返回数据编码为 UTF-8 格式为 MIME 类型固定为 `application/json` , 如 API 请求包含请求数据, 请在 HTTP 头部信息中添加 `Content-Type` ;
    + 本文档中的 API 请求时均需要在 HTTP 头部信息中添加 `X-Le-Sense-AT` , 值为 `access_token` 。

+ 0.2 返回数据解析

    如无特殊说明, 本文档中 API 返回数据为如下格式, 其中 `head` 部分存在于所有返回数据中, `ret` 标识本次请求的响应情况, msg 是对响应情况的具体描述, `body` 部分只有在包含更多返回数据时才会存在。

    ```json
    {
      "head": { // 返回数据头
        "ret": 0,  // 返回码
        "msg": "OK" // 返回信息
      },
      "body": { // 返回数据体
        ...
      }
    }
    ```

+ 0.3 全局返回码
    + 0 - 请求成功
    + 1 - 服务器错误
    + 2 - 授权错误, 访问授权 Token 无效或已过期
    + 3 - 请求参数错误
    + 4 - 调用次数达到上线
    + 5 - 无调用权限

## 测试 [/test]
### get [GET]
+ Response 200 (application/json)
        {
            "ok": true
        }

## 券码 [/tickets]

### 获取券码信息 [GET]

+ Request
    + Headers

            X-Le-Sense-AT: 42f4c188ad3da263

    + Parameters
        + ticket_type (string) - 券码类型 (选填, 传值时返回指定券码类型的券码信息)
        + ticket_name (string) - 券码名称 (选填, 模糊匹配)
        + to_page (number) - 页码 (选填, 从 1 开始, 默认第 1 页)
        + per_page (number) - 每页条数 (选填, 默认10条, 最大100条)
+ 返回数据定义
    + head - 参见全局说明
    + body -
    + tickets - 券码列表
    + ticket_type - 券码类型
    + ticket_name - 券码名称
    + ticket_total - 券码总数
    + ticket_used - 已使用数量
    + create_time - 创建时间
    + update_time - 更新时间
+ 返回码字典
    + 105 : 券码类型不存在
+ Response 200 (application/json)

    ```json
    {
        "head": {
            "ret": 0,
            "msg": "OK"
        },
        "body": {
            "tickets": [{
                "ticket_type": "AVD1KYBW8001",
                "ticket_name": "919送乐2",
                "ticket_total": 2000,
                "ticket_used": 150,
                "update_time": "1473246472121"
            },  {
                "ticket_type": "AVD1KYBW8002",
                "ticket_name": "乐次元撩妹送礼包",
                "ticket_total": 1000,
                "ticket_used": 10,
                "update_time": "1473246472121"
            }]
        }
    }
    ```
### 创建并导入券码 [POST]

+ Request
    + Headers

            Content-Type: application/json
            X-Le-Sense-AT: 42f4c188ad3da263

    + Body

            {
                batch_no: ddd, //(string, optional) - 导入批次号(选填, 没有的话则只创建券码)
                ticket_name: sdfds //(string, required) - 券码名称
            }

+ 返回数据定义
    + head - 参见全局说明
+ 返回码字典
    + 103 - 券码名称重复
    + 104 - 导入批次号不存在
+ Response 200 (application/json)

    ```json
    {
        "head": {
            "ret": 0,
            "msg": "OK"
        }
    }
    ```

### 补充并导入券码 [PUT]

+ Request
    + Headers

            Content-Type: application/json
            X-Le-Sense-AT: 42f4c188ad3da263

    + Body

            {
                batch_no: ddd, //(string, optional) - 导入批次号(选填, 没有的话则只创建券码)
                ticket_name: sdfds //(string, required) - 券码名称
            }

+ 返回数据定义
    + head - 参见全局说明
+ 返回码字典
    + 103 - 券码名称重复
    + 104 - 导入批次号不存在
+ Response 200 (application/json)

    ```json
    {
        "head": {
            "ret": 0,
            "msg": "OK"
        }
    }
    ```
