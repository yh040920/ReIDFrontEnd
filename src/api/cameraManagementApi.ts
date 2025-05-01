import request from '@/utils/http'

export interface CameraTable{
    CameraId: string;
    RTSPinput: string;
    Location: string;
    Load: number;
    Show: number;
    Lunch: number;
    Detect: number;
}

export const WebSocketConnection = 'ws://your-backend-websocket-url'

export const csvUplod = ''

export interface CameraTableResponse {
    success: boolean;
    data: CameraTable[];
    error: string;
}

export interface NormResponse {
    success: boolean;
    error: string;
}

export interface edit {
    CameraId: string;
    Location: string;
    RTSPinput: string
}

// 摄像头管理相关方法  所有的返回都已经.data了
export class CameraService {
    // 获取摄像头信息表
    static getCameraInfo() {
      return request.post({url: ''}) as Promise<CameraTableResponse>
    }

    // 全部关闭
    static allCameraDown() {
        return request.post({url: ''}) as Promise<NormResponse>
    }

    // 全部开启
    static allCameraLunch() {
        return request.post({url: ''}) as Promise<NormResponse>
    }

    // 单个启动
    static lunchOne(data: any) {
        return request.post({url: '', data: data}) as Promise<NormResponse>
    }

    // 单个检测
    static detectOne(data: any) {
        return request.post({url: '', data: data}) as Promise<NormResponse>
    }

    // 单个关闭
    static shutDownOne(data: any) {
        return request.post({url: '', data: data}) as Promise<NormResponse>
    }

    // 批量开启
    static batchLunch(data: string[]) {
        return request.post({url: '', data: data}) as Promise<NormResponse>
    }

    // 勾选和取消勾选的时候，改变对应摄像头的show状态
    static changeShow(data: string[], model: string){
        // 其中model参数是看这次请求时勾选还是取消勾选,有add和remove
        const mixedData = {CameraIds: data, model: model} 
        request.post({url: '', data: mixedData}); //无返回
    }

    // 编辑摄像头信息
    static editCamera(data: edit){
        return request.post({url: '', data: data}) as Promise<NormResponse>
    }

    // 添加摄像头信息
    static addCamera(data: edit){
        return request.post({url: '', data: data}) as Promise<NormResponse>
    }

    // 删除
    static deleteByCameraIds(data: string[]){
        return request.post({url: '', data: data}) as Promise<NormResponse>
    }
}
  