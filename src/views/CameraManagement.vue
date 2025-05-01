<template>
  <el-card shadow="never">
    <el-row :gutter="15">
      <el-col :span="4">
        <el-card style="height: 100%; border: none; border-right: 1px solid #EBEEF5;" shadow="never" >
          <template #header>
            <el-text class="mx-1" size="large" style="font-weight: bold; font-size: 24px;">摄像头源</el-text>
            <div class="button-group" style="margin-top: 20px;">
              <el-button size="small" @click="allCameraLunch":disabled="cameras.length === 0">全部启动</el-button>
              <el-button size="small" @click="allCameraDown" :disabled="cameras.length === 0">全部关闭</el-button>
              <el-button size="small" @click="batchLunch" :disabled="checkedCameras.length === 0">批量启动</el-button>
            </div>
          </template>
          <el-checkbox
            v-model="checkAll"
            :indeterminate="isIndeterminate"
            @change="handleCheckAllChange"
          >
            全部查看
          </el-checkbox>
          <el-checkbox-group
            v-model="checkedCameras"
            @change="handleCheckedCamerasChange"
          >
            <div v-for="camera in cameras" :key="camera.CameraId">
              <el-checkbox :label="camera.CameraId" :value="camera.CameraId">
                {{ camera.CameraId }}
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </el-card>
      </el-col>
      <el-col :span="20">
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick" type="card">
          <el-tab-pane label="摄像头展示" name="first">
              <div class="card-container">
              <el-card
                v-for="item in activeCards" 
                :key="item.id"
                shadow="hover"
                style="width: 30%; margin: 20px; display: inline-block; aspect-ratio: 1 / 1;"
              >
                <template #header>
                  <div>
                    <el-text class="mx-1" type="primary" style="margin-right: 10px;">{{ item.name }}</el-text>
                    <el-button size="small" @click="lunch(item.name)" :disabled="!((cameras.find(cam => cam.CameraId === item.name) || { Lunch: 0 }).Lunch === 0)">启动</el-button>
                    <el-button size="small" @click="detection(item.name)" :disabled="!((cameras.find(cam => cam.CameraId === item.name) || { Detect: 0 }).Detect === 0)">检测识别</el-button>
                    <el-button size="small" @click="shutDown(item.name)">关闭</el-button>
                  </div>
                </template>
                <el-image :src='item.src' fit="cover"/>
              </el-card>
            </div>
          </el-tab-pane>
          <el-tab-pane label="摄像头管理" name="second">
            <CamerasInfo />
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { CheckboxValueType } from 'element-plus'
import type { TabsPaneContext } from 'element-plus'
import CamerasInfo from './camerasInfo.vue'
import { CameraService, WebSocketConnection, CameraTable } from '@/api/cameraManagementApi'
import emptyImg from '@/assets/img/state/empty.png';

const checkAll = ref(false)
const isIndeterminate = ref(false)
const checkedCameras = ref<string[]>([])
const cameras = ref<Array<{ CameraId: string; Load: number; Show: number; Lunch: number; Detect: number }>>([])


const camerasTable = ref<CameraTable []>([])

// 提供 camerasTable 供子组件CamerasInfo使用
provide('camerasTable', camerasTable);

// 活动的卡片,activeCards用于存储有哪些摄像头id被展示了
const activeCards = ref<Array<{id: number, name: string, src: string}>>([])
let cardIdCounter = 0 //这是已展示的摄像头的数量

const activeName = ref('first')

const handleClick = (tab: TabsPaneContext, event: Event) => {
  // 这是点击标签页的触发
}

// 监听checkedCameras的变化，每次有勾选就会触发
watch(checkedCameras, (newVal, oldVal) => {
  // 找出新增的项，即勾选了哪一项
  const added = newVal.filter(item => !oldVal.includes(item));
  // 找出删除的项，即取消了哪一项
  const removed = oldVal.filter(item => !newVal.includes(item));
  if(added.length > 0){ // 新增
    // 添加新卡片
    added.forEach(name => {
      activeCards.value.push({
        id: ++cardIdCounter,
        name,
        src: emptyImg
      })
    })
    CameraService.changeShow(added, 'add');

  }else{
    // 移除卡片
    removed.forEach(name => {
      const index = activeCards.value.findIndex(card => card.name === name)
      if (index !== -1) {
        activeCards.value.splice(index, 1);
      }
    })
    CameraService.changeShow(added, 'remove');
  }
})

const handleCheckAllChange = (val: CheckboxValueType) => {
  checkedCameras.value = val ? cameras.value.map(camera => camera.CameraId) : [];
  isIndeterminate.value = false;
}

const handleCheckedCamerasChange = (value: CheckboxValueType[]) => {
  const checkedCount = value.length;
  checkAll.value = checkedCount === cameras.value.length;
  isIndeterminate.value = checkedCount > 0 && checkedCount < cameras.value.length;
}

// 全部开启摄像头按钮
const allCameraLunch = async () => {
  const allCameraLunchresult = await CameraService.allCameraLunch()
    if(allCameraLunchresult.success){
      for (const camera of cameras.value) {
      camera.Lunch = 1;
      camera.Detect = 1;
      // 这里实现全部启动并后台运行功能
    }
    ElMessage.success("全部启动成功")
  }else{
    ElMessage.error(allCameraLunchresult.error);
  }
}

// 全部关闭摄像头按钮
const allCameraDown = async () => {
  const allCameraDownresult = await CameraService.allCameraDown()
  if(allCameraDownresult.success){ // 后端关闭成功
    for (const camera of cameras.value) {
      camera.Lunch = 0;
      camera.Detect = 0;
    }
    ElMessage.success("全部关闭成功")
  }else{
    ElMessage.error(allCameraDownresult.error);
  }

}

const batchLunch = async () => {
  const batchLunchResult = await CameraService.batchLunch(checkedCameras.value);
  if(batchLunchResult.success){
    ElMessage.success("批量启动成功");
  }else{
    ElMessage.error(batchLunchResult.error);
  }
}

const lunch = async (ca_id: string) =>{

  const lunchOneResult = await CameraService.lunchOne({CameraId: ca_id})
  if(lunchOneResult.success){
    const item = cameras.value.find(camera => camera.CameraId === ca_id)
    if (item) {
      item.Lunch = 1;
    }
    // 这里是后端请求，得到图像的位置
    ElMessage.success(ca_id+"成功启动！")
  }else{
    ElMessage.error(lunchOneResult.error)
  }

}

const detection = async (ca_id: string) =>{
  const item = cameras.value.find(camera => camera.CameraId === ca_id)
  if (item) {
    if(item.Lunch === 0){
      ElMessage.error(item.CameraId+"没有启动")
    }else{
      const detectionResult = await CameraService.detectOne({CameraId: ca_id})

      if(detectionResult.success){
        item.Detect = 1;
        // 这里是后端请求，请求开始识别的位置
        ElMessage.success(ca_id+"成功开始检测！")
      }else{
        ElMessage.error(detectionResult.error)
      }
    }
  }
}

// 关闭某一个
const shutDown = async (ca_id: string) =>{
  const shutDownOneResult = await CameraService.shutDownOne({CameraId: ca_id})
  if(shutDownOneResult.success){
    const item = cameras.value.find(camera => camera.CameraId === ca_id)
    if(item){
      item.Lunch = 0;
      item.Detect = 0;
      // 同样的要通知后端
      ElMessage.success(ca_id+"成功关闭！")
    }
  }else{
    ElMessage.error(shutDownOneResult.error)
  }

}

const ws = ref<WebSocket | null>(null);
// [加载，显示，开启，检测]
onMounted( async () => {
  // const getCameraInfoResult = await CameraService.getCameraInfo()
  // if(getCameraInfoResult.success){
  //   camerasTable.value = getCameraInfoResult.data
  //   // 后续将camerasTable.value过滤成mockCameras的样子即可
  // }else{
  //   ElMessage.error(getCameraInfoResult.error)
  // }
  // 模拟从后端请求数据
  const result = [
    {
        "CameraId": "摄像头1",
        "Load": 1,
        "Show": 1,
        "Lunch": 1,
        "Detect": 0,
        "RTSPinput": "rtsp://example.com/input/camera1",
        "Location": "31.230416,121.473701"
    },
    {
        "CameraId": "摄像头2",
        "Load": 1,
        "Show": 1,
        "Lunch": 1,
        "Detect": 0,
        "RTSPinput": "rtsp://example.com/input/camera2",
        "Location": "39.904211,116.407395"
    },
    {
        "CameraId": "摄像头3",
        "Load": 1,
        "Show": 0,
        "Lunch": 0,
        "Detect": 0,
        "RTSPinput": "rtsp://example.com/input/camera3",
        "Location": "23.129110,113.264381"
    },
    {
        "CameraId": "摄像头4",
        "Load": 1,
        "Show": 0,
        "Lunch": 0,
        "Detect": 0,
        "RTSPinput": "rtsp://example.com/input/camera4",
        "Location": "22.543099,114.057868"
    }
  ]
  camerasTable.value = result
  const mockCameras = result.map(item => ({
    CameraId: item.CameraId,
    Load: item.Load,
    Show: item.Show,
    Lunch: item.Lunch,
    Detect: item.Detect
  }));
  cameras.value = mockCameras;

  // 根据 Show 的值判断哪些摄像头一来就应该显示，后期接入视频了这个地方还需要处理接入视频
  const initialCheckedCameras = mockCameras.filter(camera => camera.Show === 1).map(camera => camera.CameraId);
  if( initialCheckedCameras.length > 0){
    isIndeterminate.value = true
  }
  checkedCameras.value = initialCheckedCameras;

  // 初始化 WebSocket
  ws.value = new WebSocket(WebSocketConnection);

  ws.value.onopen = () => {
    ElMessage.success('WebSocket 连接已建立');
  };


  // 后端返回格式{
  //   "type": "image",
  //   "cameraId": "摄像头1",
  //   "frame": "base64编码的图像数据"
  // }
  ws.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'frame') {
      const blob = new Blob([data.frame], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      const card = activeCards.value.find(card => card.name === data.cameraId);
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

onUnmounted(() => {
  // 组件卸载时关闭 WebSocket
  if (ws.value) {
    ws.value.close();
  }
});
</script>  

<style>
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-col {
  border-radius: 4px;
}
.card-container {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

</style>