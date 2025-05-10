import request from '@/utils/http'
import type { UploadProps, UploadUserFile } from 'element-plus'

interface NormResponse {
    success: boolean;
    error: string;
}

export interface camerasInterface {
    value: number;
    name: string;
}

interface getPersonNumByMonthInterface{
    personNum: { [key: string]: number }; // 后端返回格式为{"图书馆门口": 100, "校门口": 200, "一食堂门口": 150, "二食堂门口": 300}即CameraId: count
    success: boolean;
    error: string;
}

interface getCameraStatusNumBySortInterface{
    cameras: camerasInterface;
    success: boolean;
    error: string;
}

export const websocket = ""

// 查找页面相关方法  所有的返回都已经.data了
export class DataViewService {

    // 通过这个方法获取以月为单位的摄像头行人量数据,后端判断如果data字符串不是now就是用户在选择，如果是no则是自动触发，选择当前月
    static getPersonNumByMonth(data: string) {
      return request.post({url: '', data: data}) as Promise<getPersonNumByMonthInterface>
    }

    // 通过这个方法获取摄像头状态分类数量
    static getCameraStatusNumBySort() {
        return request.post({url: ''}) as Promise<getCameraStatusNumBySortInterface>
      }
}
  