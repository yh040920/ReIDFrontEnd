import request from '@/utils/http'
import type { UploadProps, UploadUserFile } from 'element-plus'

interface NormResponse {
    success: boolean;
    error: string;
}

export interface RolesTbleInterface {
    name: string,
    allow: string,
    des: string,
    date: string,
    status: number
  }

interface getTableResult {
    success: boolean;
    error: string;
    tableData: RolesTbleInterface;
}

interface addInterface  {
    id: string;
    name: string;
    des: string;
    status: boolean
  }

export class RoleSevere {
    // 通过这个方法获取role用户身份表格内容
    static getRolesTable() {
      return request.post({url: ''}) as Promise<getTableResult>
    }

    // 通过这个方法添加用户权限信息
    static addRole(data: addInterface) {
        return request.post({url: '', data: data}) as Promise<NormResponse>
    }
}
  