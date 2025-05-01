import request from '@/utils/http'

interface NormResponse {
    success: boolean;
    error: string;
}

export const localFindImgUploadAction = '' // 本地视频查找目标图片上传地址

export const localFindVideoUploadAction = '' // 本地视频查找目标图片上传地址

export const WebSocketConnection = 'ws://your-backend-websocket-url/' // 本地


// 查找页面相关方法  所有的返回都已经.data了
export class LocalFindService {

    // 通过传入的data即要删除的图片的名字通知后端删除对应图片
    static deleteImage(data: string) {
      return request.post({url: '', data: data}) as Promise<NormResponse>
    }

    // 通知后端删除对某个视频，data是上传的视频的名称
    static deleteVideo(data: string){
        return request.post({url: '', data: data}) as Promise<NormResponse>
    }

    // 通知后端开始本地检测
    static startFind(){
        return request.post({url: ''}) as Promise<NormResponse>
    }
}
  