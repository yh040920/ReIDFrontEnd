import request from '@/utils/http'

interface NormResponse {
    success: boolean;
    error: string;
}

export const localFindImgDeleteAction = ''

export const WebSocketConnection = 'ws://your-backend-websocket-url/'

// 查找页面相关方法  所有的返回都已经.data了
export class LocalFindService {

    // 该action是后端接收图片的方法url
    static localAction = '';

    // 通过传入的data即要删除的图片的名字通知后端删除对应图片
    static deleteImage(data: string) {
      return request.post({url: '', data: data}) as Promise<NormResponse>
    }

    // 通知后端删除对某个视频
    static deleteVideo(data: string){
        return request.post({url: '', data: data}) as Promise<NormResponse>
    }

    static startFind(){
        return request.post({url: ''}) as Promise<NormResponse>
    }
}
  