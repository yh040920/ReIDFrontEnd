import request from '@/utils/http'


export interface NormResponse {
    success: boolean;
    error: string;
}

interface nameList {
    names: string[];
    success: boolean;
    error: string;
}

interface searchInfo {
    page: number;
    timeLimit: string;
    CameraId: string;
    pageSize: number;
}

export interface image {
    name: string;
    url: string;
}

interface searchResult {
    success: boolean;
    error: string;
    images: image[];
    totalPages: number;
}

// 图片管理相关方法  所有的返回都已经.data了
export class ImgManagementService {
    // 获取摄像头名称表
    static getCameraNames() {
      return request.post({url: ''}) as Promise<nameList>
    }

    // 按照页码、时间段和摄像头查找
    static search(data: searchInfo) {
        return request.post({url: '', data: data}) as Promise<searchResult>
    }
}
  