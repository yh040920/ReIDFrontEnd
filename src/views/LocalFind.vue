<template>
    <el-card shadow="never">
        <el-text class="mx-1" size="large" style="font-weight: bold; font-size: 24px;">目标图片</el-text>
        <el-divider />
        <div style="margin-top: 20px; margin-bottom: 20px;">
            <el-upload
                v-model:file-list="fileList"
                :action='localFindImgDeleteAction'
                list-type="picture-card"
                :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove"
                :on-success="upLoadSuccess"
            >
                <el-icon><Plus /></el-icon>
            </el-upload>

            <el-dialog v-model="dialogVisible" style="width: fit-content;">
                <img w-full :src="dialogImageUrl" alt="Preview Image" />
            </el-dialog>
        </div>
        <el-text class="mx-1" size="large" style="font-weight: bold; font-size: 24px;">本地视频</el-text>
        <el-divider />
        <el-upload
            class="upload-demo"
            drag
            action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
            multiple
        >
            <el-icon class="el-icon--upload"><VideoCamera /></el-icon>
            <div class="el-upload__text">
                拖拽视频到这儿 或 <em>点击上传</em>
            </div>
        </el-upload>
        <el-collapse style="width: 100%; border-top: none;" v-model="activeNames" @change="handleChange" >
            <el-collapse-item name="1">
                <template #title>
                    <el-icon><Setting /></el-icon>
                    <el-text type="primary" size="large">Setting</el-text>
                </template>
                <el-button @click="startFind">开始查找</el-button>
            </el-collapse-item>
        </el-collapse>
        <div style="margin-bottom: 20px;">
            <el-card
                v-for="item in activeVideos" 
                :key="item.name"
                shadow="hover"
                style="width: 15%; margin: 20px; display: inline-block; aspect-ratio: 1 / 1;"
              >
                <template #header>
                  <div style="display: flex; justify-content: space-between;"> 
                    <el-text class="mx-1" type="primary" style="margin-right: 10px;">{{ item.name }}</el-text>
                    <el-button size="small" @click="deleteVideoByName(item.name)">删除</el-button>
                  </div>
                </template>
                <el-image :src='item.src' style="width: 100%; height: auto;" fit="cover"/>
              </el-card>
        </div>
        <el-text class="mx-1" size="large" style="font-weight: bold; font-size: 24px;">查找结果</el-text>
        <el-divider />
        <div style="display: flex; flex-wrap: wrap; gap: 20px;">
            <el-card v-for="findResult in findResults" shadow="hover" style="margin-bottom: 20px; width: fit-content; border: none;">
            <template #header>
                <div class="card-header">
                    <el-text>{{ findResult.name }}</el-text>
                </div>
            </template>
            <el-image v-for="src in findResult.srcs" style="width: auto; height: 10vh; margin-right: 10px;" :src="src"/>
        </el-card>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import type { UploadProps, UploadUserFile } from 'element-plus'
import { LocalFindService, localFindImgDeleteAction, WebSocketConnection } from '@/api/localFindApi'
import type { CollapseModelValue, ComponentSize } from 'element-plus'

const activeNames = ref(['1'])

const handleChange = (val: CollapseModelValue) => {
  console.log(val)
}

const activeVideos = ref<{name: string; src: string}[]>([])
const findResults = ref<{name: string; srcs: string[]}[]>([])
//   {name: 'food.jpeg', url: '',}用于存储查找目标图片的列表
const fileList = ref<UploadUserFile[]>([
    {
        name: 'food.jpeg',
        url: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.UWgMkVm4bkDKwMOnrWZ0vAHaLt?w=115&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7',
    },
    {
        name: 'food.jpeg',
        url: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.UWgMkVm4bkDKwMOnrWZ0vAHaLt?w=115&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7',
    },
])
const dialogVisible = ref(false)
const dialogImageUrl = ref('')

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

const handleRemove: UploadProps['onRemove'] = async (uploadFile, uploadFiles) => {
    // 向后端发送uploadFile.name以删除图片
    const handleRemoveResult = await LocalFindService.deleteImage(uploadFile.name);
    if(handleRemoveResult.success){
        ElMessage.success("删除成功");
    }else{
        ElMessage.error(handleRemoveResult.error);
    }
}

const deleteVideoByName = async (name: string) => {
    // const deleteVideoByNameResult = await LocalFindService.deleteVideo(name)
    const deleteVideoByNameResult = {success: true, error: "warning"}
    if(deleteVideoByNameResult.success){
        ElMessage.success(`已删除视频: ${name}`);
        activeVideos.value = activeVideos.value.filter(video => video.name !== name);
    }else{
        ElMessage.error(deleteVideoByNameResult.error);
    }
    
}

const upLoadSuccess = (response: {success: boolean; error: string; videoNames: {name: string; src: string} []}) => {
    if(response.success){
        activeVideos.value = response.videoNames
        ElMessage.success("上传成功");
    }else{
        ElMessage.error(response.error);
    }
}

const startFind = async() => {
    const startFindResult = await LocalFindService.startFind();
    if(startFindResult.success){
        ElMessage.success("开始检测")
    }else{
        ElMessage.error(startFindResult.error)
    }
}


const ws = ref<WebSocket | null>(null);

onMounted(() => {
    
    activeVideos.value = [{
        name: "yyh1.mp4",
        src: "https://tse4-mm.cn.bing.net/th/id/OIP-C.u7vpthRCGVxLIaGacmcLQQHaHa?w=187&h=188&c=7&r=0&o=5&dpr=1.8&pid=1.7"
    },
    {
        name: "yyh2.mp4",
        src: 'https://tse2-mm.cn.bing.net/th/id/OIP-C.iVKpmfAaxfF0eWw08UI9gQHaHa?w=154&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7'
    }]
    findResults.value = [{
        name: "yyh1.mp4",
        srcs: ["https://tse4-mm.cn.bing.net/th/id/OIP-C.u7vpthRCGVxLIaGacmcLQQHaHa?w=187&h=188&c=7&r=0&o=5&dpr=1.8&pid=1.7",
            "https://tse4-mm.cn.bing.net/th/id/OIP-C.u7vpthRCGVxLIaGacmcLQQHaHa?w=187&h=188&c=7&r=0&o=5&dpr=1.8&pid=1.7"
        ]
    },
    {
        name: "yyh2.mp4",
        srcs: ['https://tse2-mm.cn.bing.net/th/id/OIP-C.iVKpmfAaxfF0eWw08UI9gQHaHa?w=154&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7']
    }]
    // 初始化 WebSocket
    ws.value = new WebSocket(WebSocketConnection);
    console.log(ws.value);
    
    ws.value.onopen = () => {
        ElMessage.success('WebSocket 连接已建立');
    };

    // 后端返回格式{
    //   "type": "video", or "videoResult"
    //   "videoName": "摄像头1",
    //   "frame": "base64编码的图像数据" or {src, src, src}
    // }
    // 后端返回格式{
    //   "type": "video", or "videoResult"
    //   "videoName": "摄像头1",
    //   "frame": "base64编码的图像数据" or {src, src, src}
    // }
    ws.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'video') {
            const blob = new Blob([data.frame], { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            const card = activeVideos.value.find(card => card.name === data.videoName);
            if (card) {
                card.src = url;
            }
        }else if(data.type === 'videoResult'){
            const blob = new Blob([data.frame], { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            const card = activeVideos.value.find(card => card.name === data.videoName);
            if (card) {
                card.src = url;
            }
        }
    };

    ws.value.onclose = () => {
        ElMessage.error('WebSocket 连接已关闭');
    };

    ws.value.onerror = (error) => {
        ElMessage.error('WebSocket 错误:'+ error);
    };
})

</script>
