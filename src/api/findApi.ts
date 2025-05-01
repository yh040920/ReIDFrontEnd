import request from '@/utils/http'
import type { UploadProps, UploadUserFile } from 'element-plus'

interface NormResponse {
    success: boolean;
    error: string;
}

export interface findResult {
  Time: string;
  CameraId: string;
  Location: number[];
  resultUrl: string[];
}

interface findResultyyh {
    success: boolean;
    error: string;
    data: findResult[];
}

interface findInfo{
  findTimeLimit: string;
  findText: string;
}

export interface historyInterface {
  Time: string;
  findImages: UploadUserFile[];
  findResults: findResult[];
}

interface historyInterfaceyyh {
  success: boolean;
  error: string;
  data: historyInterface[];
}

// 查找页面相关方法  所有的返回都已经.data了
export class FindService {

    // 该action是后端接收图片的方法url
    static action = '';

    // 通过传入的data即要删除的图片的名字通知后端删除对应图片
    static deleteImage(data: string) {
      return request.post({url: '', data: data}) as Promise<NormResponse>
    }

    // 通知开始查找，因为图片选择即上传，所以开始查找的时候，要查找的图片都已经在后端了。
    // 主要是传入data，格式是findInfo格式，用于得到查找时间段，和查找字符。
    static informStartFind(data: findInfo) {
      return request.post({url: '', data: data}) as Promise<findResultyyh>
    }
    
    // 查看历史查找记录，返回格式为historyInterface[]
    static getHistory() {
      return request.post({url: ''}) as Promise<historyInterfaceyyh>
    }
}
  